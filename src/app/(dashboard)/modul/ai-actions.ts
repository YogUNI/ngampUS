"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { callGemini, callGeminiChat, GeminiMessage, GeminiPart } from "@/lib/gemini";

async function getSignedInUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

/**
 * Helper to fetch document buffer from Supabase storage or public URL and format as GeminiPart
 */
async function loadModuleDocumentPart(fileUrl?: string | null, fileName?: string | null): Promise<GeminiPart | null> {
  if (!fileUrl) return null;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit to 20MB for Gemini inlineData
    if (buffer.length > 20 * 1024 * 1024) {
      return null;
    }

    const lowerName = (fileName || "").toLowerCase();
    let mimeType = "application/pdf";
    if (lowerName.endsWith(".pdf")) {
      mimeType = "application/pdf";
    } else if (lowerName.endsWith(".png")) {
      mimeType = "image/png";
    } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
      // Plain text or markdown
      const textContent = buffer.toString("utf-8");
      return {
        text: `\n\n=== ISI DOKUMEN MATERI (${fileName}) ===\n${textContent.slice(0, 50000)}\n=== AKHIR DOKUMEN ===\n\n`,
      };
    } else {
      // For other types, try application/pdf or fallback
      mimeType = "application/pdf";
    }

    const base64Data = buffer.toString("base64");
    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
  } catch (err) {
    console.warn("Gagal memuat dokumen untuk konteks AI:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI SUMMARY & KEY POINTS GENERATOR (DEEP RAG GROUNDED)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateModuleSummary(moduleId: string) {
  const { supabase, user } = await getSignedInUser();

  const { data: moduleData, error } = await supabase
    .from("course_modules")
    .select("*, courses(nama_matkul, kode_matkul)")
    .eq("id", moduleId)
    .eq("user_id", user.id)
    .single();

  if (error || !moduleData) {
    throw new Error("Modul tidak ditemukan.");
  }

  // Fetch document if available
  const docPart = await loadModuleDocumentPart(moduleData.file_url, moduleData.file_name);

  const promptText = `
Kamu adalah Dosen & Tutor Akademik Terbaik di Kampus.
Tolong buatkan rangkuman terstruktur, tajam, dan sangat komprehensif untuk mahasiswa berdasarkan materi kuliah berikut:

- Mata Kuliah: ${moduleData.courses?.nama_matkul || "Kuliah"}
- Pertemuan ke-: ${moduleData.pertemuan}
- Topik Pertemuan: ${moduleData.topik}
- Silabus / Deskripsi: ${moduleData.deskripsi || "Tidak ada deskripsi"}
- Catatan Mahasiswa: ${moduleData.catatan || "Tidak ada catatan"}
- Dokumen Terlampir: ${moduleData.file_name ? `${moduleData.file_name} (terlampir di input ini)` : "Tidak ada file"}

${
  docPart
    ? "PENTING: Pelajari seluruh isi dokumen/slide materi terlampir. Ambil konsep, rumus, definisi, dan poin esensial dari dokumen tersebut!"
    : "Gunakan silabus, catatan, dan pengetahuan akademik mendalam tentang topik ini."
}

Balas HANYA dalam format JSON valid tanpa format markdown codeblock apapun (tidak ada \`\`\`json). Struktur JSON yang wajib kamu ikuti:
{
  "summary": "Penjelasan ringkas 2-3 paragraf padat tentang esensi topik ini...",
  "key_points": [
    "Poin kunci / konsep utama 1 (cantumkan istilah atau rumus penting)",
    "Poin kunci / konsep utama 2",
    "Poin kunci / konsep utama 3",
    "Poin kunci / konsep utama 4",
    "Poin kunci / konsep utama 5"
  ],
  "exam_tips": [
    "Prediksi soal ujian / konsep yang sering keluar 1",
    "Hal yang perlu diwaspadai / trik pengerjaan 2",
    "Contoh penerapan praktis 3"
  ]
}
`;

  const requestParts: GeminiPart[] = [];
  if (docPart) {
    requestParts.push(docPart);
  }
  requestParts.push({ text: promptText });

  const systemInstruction =
    "Kamu asisten studi cerdas mahasiswa kampus. Selalu hasilkan output JSON murni yang valid, tajam, dan langsung berdasar pada materi modul.";
  const rawResponse = await callGemini(requestParts, systemInstruction);

  let parsedData: { summary: string; key_points: string[]; exam_tips: string[] };
  try {
    const cleaned = rawResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    parsedData = JSON.parse(cleaned);
  } catch {
    parsedData = {
      summary: rawResponse,
      key_points: ["Pahami konsep dasar topik ini", "Latihan soal dan baca modul secara berkala"],
      exam_tips: ["Pelajari definisi dan studi kasus utama"],
    };
  }

  // Save to database
  await supabase
    .from("course_modules")
    .update({
      ai_summary: parsedData.summary,
      ai_key_points: parsedData.key_points,
      ai_exam_tips: parsedData.exam_tips,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId)
    .eq("user_id", user.id);

  revalidatePath("/modul");
  return parsedData;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AI QUIZ GENERATOR (DEEP RAG GROUNDED)
// ─────────────────────────────────────────────────────────────────────────────
export type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export async function generateModuleQuiz(moduleId: string) {
  const { supabase, user } = await getSignedInUser();

  const { data: moduleData, error } = await supabase
    .from("course_modules")
    .select("*, courses(nama_matkul)")
    .eq("id", moduleId)
    .eq("user_id", user.id)
    .single();

  if (error || !moduleData) {
    throw new Error("Modul tidak ditemukan.");
  }

  // Fetch document if available
  const docPart = await loadModuleDocumentPart(moduleData.file_url, moduleData.file_name);

  const promptText = `
Buatkan 5 soal kuis pilihan ganda (A, B, C, D) yang bermutu tinggi, menguji pemahaman konsep, logika analitis, dan studi kasus untuk mahasiswa:

- Mata Kuliah: ${moduleData.courses?.nama_matkul || "Kuliah"}
- Pertemuan: Ke-${moduleData.pertemuan}
- Topik Materi: ${moduleData.topik}
- Rangkuman Materi: ${moduleData.ai_summary || moduleData.deskripsi || moduleData.catatan || "Dasar topik materi"}
- Dokumen Terlampir: ${moduleData.file_name ? `${moduleData.file_name} (terlampir)` : "Tidak ada"}

${
  docPart
    ? "PENTING: Buat soal yang benar-benar menguji materi, diagram, definisi, atau studi kasus yang ada di dalam DOKUMEN MODUL terlampir!"
    : "Buat soal berdasarkan silabus, topik, dan rangkuman materi tersebut."
}

Wajib balas HANYA dengan JSON valid (tanpa pembungkus markdown codeblock). Format struktur JSON:
{
  "questions": [
    {
      "question": "Pertanyaan soal kuis...",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correct_index": 0,
      "explanation": "Penjelasan mengapa jawaban tersebut tepat dan mendidik..."
    }
  ]
}
`;

  const requestParts: GeminiPart[] = [];
  if (docPart) {
    requestParts.push(docPart);
  }
  requestParts.push({ text: promptText });

  const systemInstruction =
    "Kamu pembuat soal ujian universitas profesional. Format kuis harus JSON valid dengan 5 soal berkualitas tinggi.";
  const rawResponse = await callGemini(requestParts, systemInstruction);

  let questions: QuizQuestion[] = [];
  try {
    const cleaned = rawResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    questions = parsed.questions || [];
  } catch (err) {
    throw new Error("Gagal memproses soal kuis AI. Coba generate ulang.");
  }

  // Delete previous quiz if any and insert new one
  await supabase.from("module_quizzes").delete().eq("module_id", moduleId).eq("user_id", user.id);

  const { data: quizRecord, error: insertError } = await supabase
    .from("module_quizzes")
    .insert({
      user_id: user.id,
      module_id: moduleId,
      judul: `Kuis Evaluasi Pertemuan ${moduleData.pertemuan}: ${moduleData.topik}`,
      questions: questions,
      total_soal: questions.length,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error("Gagal menyimpan kuis ke database.");
  }

  revalidatePath("/modul");
  return quizRecord;
}

export async function submitQuizScore(quizId: string, score: number) {
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase
    .from("module_quizzes")
    .update({
      skor_terakhir: score,
      selesai_pada: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quizId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Gagal menyimpan skor kuis.");
  }

  revalidatePath("/modul");
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI CHATBOT (RAG + DOCUMENT GROUNDING + INTENT RESOLUTION)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendModuleChatMessage(moduleId: string, userMessage: string) {
  const { supabase, user } = await getSignedInUser();

  const { data: moduleData } = await supabase
    .from("course_modules")
    .select("*, courses(nama_matkul)")
    .eq("id", moduleId)
    .eq("user_id", user.id)
    .single();

  if (!moduleData) throw new Error("Modul tidak ditemukan.");

  // Fetch past conversation for context (semantic windowing up to 14 messages)
  const { data: chatHistory } = await supabase
    .from("module_chats")
    .select("role, content")
    .eq("module_id", moduleId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(14);

  // Save user message to database
  await supabase.from("module_chats").insert({
    user_id: user.id,
    module_id: moduleId,
    role: "user",
    content: userMessage,
  });

  // Fetch document if attached
  const docPart = await loadModuleDocumentPart(moduleData.file_url, moduleData.file_name);

  // Build message history
  const formattedHistory: GeminiMessage[] = (chatHistory || []).map((c) => ({
    role: c.role === "assistant" ? "model" : "user",
    parts: [{ text: c.content }],
  }));

  // Build current turn parts: attach document first turn or current turn
  const currentParts: GeminiPart[] = [];
  if (docPart && formattedHistory.length === 0) {
    // Attach document on first message
    currentParts.push(docPart);
  } else if (docPart && formattedHistory.length > 0) {
    // If multi-turn, also provide doc part so Gemini keeps document memory active
    currentParts.push(docPart);
  }
  currentParts.push({ text: userMessage });

  formattedHistory.push({
    role: "user",
    parts: currentParts,
  });

  const systemPrompt = `
Kamu adalah "Dosen & Mentor Belajar Pribadi" mahasiswa di kampus untuk Mata Kuliah "${moduleData.courses?.nama_matkul || "Perkuliahan"}", Pertemuan ke-${moduleData.pertemuan}.

KONTEKS AKADEMIK MATERI INI:
- Topik Pertemuan: "${moduleData.topik}"
- Silabus & Deskripsi Modul: ${moduleData.deskripsi || "Tidak ada deskripsi"}
- Catatan Khusus Kuliah: ${moduleData.catatan || "Tidak ada catatan"}
- Ringkasan Esensi Materi: ${moduleData.ai_summary || "Belum dirangkum"}
- Poin-poin Kunci Modul: ${moduleData.ai_key_points?.join("; ") || "Tidak ada poin"}
- Dokumen Referensi Modul: ${moduleData.file_name ? `${moduleData.file_name} (terlampir langsung di input dokumen)` : "Tidak ada file lampiran"}

ALGORITMA & PROTOKOL KECERDASAN KAMU (SANGAT PENTING):
1. **PEMAHAMAN MAKSUD MAHASISWA (SMART INTENT RESOLVER)**:
   - Mahasiswa sering kali bertanya dengan bahasa santai, singkat, gaul, atau tidak lengkap (contoh: "maksudnya gimana bro?", "kasih contoh dong", "bagian sorting bingung", "rumusnya apa?", "fungsinya buat apa?").
   - JANGAN PERNAH menyuruh mahasiswa mengulang pertanyaan atau menjawab "mohon perjelas pertanyaan Anda".
   - Deteksi maksudnya secara otomatis: Kaitkan langsung pertanyaan singkat tersebut dengan materi/topik pertemuan "${moduleData.topik}" atau isi dokumen modul yang terlampir!

2. **TRUE DOCUMENT GROUNDING & CITATION (ANTI-HALUSINASI)**:
   ${
     docPart
       ? "- Dokumen modul asli telah dilampirkan langsung pada pesan ini. Utamakan penjelasan, istilah teknis, rumus, dan studi kasus yang benar-benar ada di dalam dokumen ini!\n- Jika mengutip definisi atau rumus dari dokumen, sebutkan secara natural (misalnya: \"Berdasarkan materi pada modul...\")."
       : "- Jawablah berdasarkan topik pertemuan, silabus, dan catatan yang tersedia secara akurat."
   }

3. **GAYA BAHASA MANUSIAWI, HANGAT & CERDAS**:
   - Gunakan gaya bahasa Indonesia yang luwes, bersahabat, cerdas, seperti kakak tingkat berprestasi atau dosen muda favorit mahasiswa.
   - Hindari bahasa robot kaku, template korporat, atau pembukaan berulang-ulang yang membosankan.

4. **STRUKTUR JAWABAN YANG BERSIH & RAPI (ENAK DIBACA)**:
   - Jangan pernah membuat satu blok paragraf panjang tebal yang bikin pusing dibaca.
   - Pecah menjadi bagian-bagian logis:
     * **Penjelasan Inti**: 1-2 kalimat langsung to-the-point.
     * **Poin Kunci / Langkah Kerja**: gunakan bullet point jelas.
     * **Analogi / Contoh Nyata**: beri 1 contoh konkret dunia nyata yang relate dengan kehidupan mahasiswa.
   - Gunakan format **tebal (bold)** untuk istilah kunci atau rumus.

5. **FOKUS & TETAP DALAM KORIDOR MATERI (ANTI-NGELANTUR)**:
   - Seluruh jawaban WAJIB terikat pada mata kuliah "${moduleData.courses?.nama_matkul}" dan pertemuan ke-${moduleData.pertemuan} ("${moduleData.topik}").
   - Jika mahasiswa bertanya hal yang 100% tidak ada hubungannya dengan kuliah (misal politik, gosip, atau topik di luar perkuliahan), berikan tanggapan santai bersahabat 1 kalimat lalu arahkan kembali ke materi modul ini.
`;

  const botReply = await callGeminiChat(formattedHistory, systemPrompt);

  // Save assistant reply to database
  await supabase.from("module_chats").insert({
    user_id: user.id,
    module_id: moduleId,
    role: "assistant",
    content: botReply,
  });

  return botReply;
}

export async function getModuleChatHistory(moduleId: string) {
  const { supabase, user } = await getSignedInUser();
  const { data } = await supabase
    .from("module_chats")
    .select("id, role, content, created_at")
    .eq("module_id", moduleId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function clearModuleChatHistory(moduleId: string) {
  const { supabase, user } = await getSignedInUser();
  const { error } = await supabase
    .from("module_chats")
    .delete()
    .eq("module_id", moduleId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Gagal menghapus riwayat obrolan.");
  }
  revalidatePath("/modul");
}
