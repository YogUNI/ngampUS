"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { callGemini, callGeminiChat, GeminiMessage, GeminiPart } from "@/lib/gemini";
import { getSystemFlags } from "@/lib/system-settings";

async function getSignedInUser() {
  const flags = await getSystemFlags();
  if (!flags.ai_service_active) {
    throw new Error("Layanan AI Engine sedang diistirahatkan sejenak oleh sistem untuk optimalisasi kuota dan server. Silakan coba kembali beberapa saat lagi.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

/**
 * Helper to fetch document buffer from Supabase storage or public URL and format as GeminiPart.
 * Supported Gemini native types: application/pdf, image/png, image/jpeg, image/webp, text/plain.
 * For unsupported or failed downloads, returns null safely so AI falls back to course metadata.
 */
async function loadModuleDocumentPart(fileUrl?: string | null, fileName?: string | null): Promise<GeminiPart | null> {
  if (!fileUrl) return null;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      console.warn(`File download returned ${res.status}, falling back to text metadata.`);
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    // If Supabase returned JSON error (e.g. Bucket not found / NoSuchBucket), don't pass as document!
    if (contentType.includes("application/json")) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If buffer is too small (e.g. empty/error snippet) or exceeds 20MB limit
    if (buffer.length < 100 || buffer.length > 20 * 1024 * 1024) {
      return null;
    }

    const lowerName = (fileName || "").toLowerCase();

    // 1. Text or Markdown files
    if (lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".csv")) {
      const textContent = buffer.toString("utf-8");
      return {
        text: `\n\n=== ISI DOKUMEN MATERI (${fileName}) ===\n${textContent.slice(0, 50000)}\n=== AKHIR DOKUMEN ===\n\n`,
      };
    }

    // 2. Supported native Gemini binary types
    let mimeType = "";
    if (lowerName.endsWith(".pdf")) {
      mimeType = "application/pdf";
    } else if (lowerName.endsWith(".png")) {
      mimeType = "image/png";
    } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (lowerName.endsWith(".webp")) {
      mimeType = "image/webp";
    } else {
      // Office files (pptx, ppt, docx, doc, xlsx) cannot be sent directly as application/pdf to Gemini inlineData.
      // Instead, we return null so the AI uses full course metadata, syllabus, and notes without 400 crashes.
      console.info(`File ${fileName} is binary format not natively supported as inlineData. Fallback to metadata.`);
      return null;
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
  
  let rawResponse = "";
  try {
    rawResponse = await callGemini(requestParts, systemInstruction);
  } catch (err: any) {
    if (docPart) {
      console.warn("Generating summary with docPart failed, retrying without docPart:", err.message);
      rawResponse = await callGemini([{ text: promptText }], systemInstruction);
    } else {
      throw err;
    }
  }

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
  
  let rawResponse = "";
  try {
    rawResponse = await callGemini(requestParts, systemInstruction);
  } catch (err: any) {
    if (docPart) {
      console.warn("Generating quiz with docPart failed, retrying without docPart:", err.message);
      rawResponse = await callGemini([{ text: promptText }], systemInstruction);
    } else {
      throw err;
    }
  }

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

  // Fetch document if attached (attach on first turn or when relevant to keep payload ultra light and snappy)
  const isFirstTurn = (chatHistory || []).length === 0;
  // If summary exists and already has keypoints, we only need to fetch the full heavy PDF on the first turn or if user asks for citations
  let docPart: GeminiPart | null = null;
  if (moduleData.file_url && (isFirstTurn || !moduleData.ai_summary)) {
    docPart = await loadModuleDocumentPart(moduleData.file_url, moduleData.file_name);
  }

  // Build message history
  const formattedHistory: GeminiMessage[] = (chatHistory || []).map((c) => ({
    role: c.role === "assistant" ? "model" : "user",
    parts: [{ text: c.content }],
  }));

  // Build current turn parts: attach document on first turn or current turn
  const currentParts: GeminiPart[] = [];
  if (docPart) {
    currentParts.push(docPart);
  }
  currentParts.push({ text: userMessage });

  formattedHistory.push({
    role: "user",
    parts: currentParts,
  });

  const systemPrompt = `
Kamu adalah "ngampUS Intelligence Engine" — asisten tutor akademik cerdas nomor satu di platform ngampUS untuk Mata Kuliah "${moduleData.courses?.nama_matkul || "Perkuliahan"}", Pertemuan ke-${moduleData.pertemuan}: "${moduleData.topik}".

SUMBER BASIS PENGETAHUAN MODUL (RAG GROUNDING):
- Topik Pembahasan: "${moduleData.topik}"
- Silabus & Deskripsi Modul: ${moduleData.deskripsi || "Tidak ada deskripsi"}
- Catatan Khusus Mahasiswa: ${moduleData.catatan || "Tidak ada catatan"}
- Ringkasan Esensi Materi: ${moduleData.ai_summary || "Belum dirangkum"}
- Poin Kunci Modul: ${moduleData.ai_key_points?.join("; ") || "Tidak ada"}
- Dokumen Modul Asli: ${moduleData.file_name ? `${moduleData.file_name} (terlampir langsung)` : "Tidak ada file"}

PEDOMAN UTAMA RESPON AI (SANGAT KRUSIAL):
1. **TEPAT SASARAN & MENJAWAB INTI PERTANYAAN (DIRECT & FOCUSED)**:
   - Jawab langsung apa yang ditanyakan mahasiswa. Jangan bertele-tele dengan basa-basi pengantar panjang ("Tentu, ini penjelasannya...").
   - Jika ditanya "inti dari pertemuan ini apa", langsung rangkum 1 kalimat inti esensi topik tersebut, lalu breakdown 3-4 pilar konsep utamanya.
   - Pahami gaya bahasa mahasiswa (misal: "maksudnya gimana bro?", "bisa kasih contoh?", "bagian ini bingung"). Langsung kaitkan konteksnya dengan materi pertemuan ini secara cerdas!

2. **KUTIPAN MATERI DOKUMEN MODUL (CITATION)**:
   ${
     docPart
       ? "- Karena mahasiswa melampirkan dokumen modul (" + moduleData.file_name + "), utamakan istilah, bagan, definisi, dan rumus yang benar-benar ada di dokumen tersebut.\n- Sertakan rujukan yang natural (misal: \"Berdasarkan slide/dokumen materi pertemuan ini...\") agar mahasiswa yakin jawabannya 100% selaras dengan yang diajarkan dosen."
       : "- Berikan penjelasan akademis yang akurat sesuai standar kurikulum mata kuliah ini."
   }

3. **FORMAT RAPI & BEBAS BINTANG/ASTERISK KOTOR**:
   - Tuliskan jawaban dengan rapi.
   - Gunakan format list bullet poin (- atau •) atau angka (1., 2., 3.) untuk poin-poin.
   - Gunakan **tebal** HANYA untuk nama konsep/istilah penting agar mudah dibaca sekilas.
   - JANGAN mengacak-acak simbol asterisk seperti "* **Poin**: ...". Buatlah penulisan bullet point yang bersih dan rapi.
   - Berikan jeda baris antar paragraf agar tidak menumpuk padat.

4. **PENJELASAN YANG MENCERAHKAN (INTUITIF & RELATE)**:
   - Gunakan analogi atau contoh kasus dunia nyata yang mudah dibayangkan oleh mahasiswa.
   - Bahasa santai, cerdas, bersahabat, seperti dosen muda favorit atau asisten lab senior yang ramah.
`;

  let botReply = "";
  try {
    botReply = await callGeminiChat(formattedHistory, systemPrompt);
  } catch (err: any) {
    if (docPart) {
      console.warn("Chat call with docPart failed, retrying with text-only prompt:", err.message);
      const textOnlyHistory = formattedHistory.map((m) => ({
        role: m.role,
        parts: m.parts.filter((p) => "text" in p),
      }));
      botReply = await callGeminiChat(textOnlyHistory, systemPrompt);
    } else {
      throw err;
    }
  }

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
