"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callGemini, callGeminiChat, GeminiMessage } from "@/lib/gemini";

async function getSignedInUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI SUMMARY & KEY POINTS GENERATOR
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

  const prompt = `
Kamu adalah Dosen dan Tutor Akademik Terbaik di Kampus.
Tolong buatkan rangkuman terstruktur, tajam, dan mudah dipahami untuk mahasiswa dari materi perkuliahan berikut:

- Mata Kuliah: ${moduleData.courses?.nama_matkul || "Kuliah"}
- Pertemuan ke-: ${moduleData.pertemuan}
- Topik Pertemuan: ${moduleData.topik}
- Silabus/Deskripsi: ${moduleData.deskripsi || "Tidak ada deskripsi"}
- Catatan Mahasiswa: ${moduleData.catatan || "Tidak ada catatan"}
- Nama Dokumen Terlampir: ${moduleData.file_name || "Tidak ada file"}

Balas HANYA dalam format JSON valid tanpa format markdown codeblock apapun (tidak ada \`\`\`json). Struktur JSON yang wajib kamu ikuti:
{
  "summary": "Penjelasan ringkas 2-3 paragraf padat tentang esensi topik ini...",
  "key_points": [
    "Poin kunci / konsep utama 1",
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

  const systemInstruction = "Kamu asisten studi cerdas mahasiswa kampus. Selalu hasilkan output JSON murni yang valid.";
  const rawResponse = await callGemini(prompt, systemInstruction);

  let parsedData: { summary: string; key_points: string[]; exam_tips: string[] };
  try {
    const cleaned = rawResponse.replace(/`json/g, "").replace(/`/g, "").trim();
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
// 2. AI QUIZ GENERATOR
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

  const prompt = `
Buatkan 5 soal kuis pilihan ganda (A, B, C, D) yang berkualitas tinggi, menguji pemahaman konsep, logika analitis, dan studi kasus untuk mahasiswa:

- Mata Kuliah: ${moduleData.courses?.nama_matkul || "Kuliah"}
- Pertemuan: Ke-${moduleData.pertemuan}
- Topik Materi: ${moduleData.topik}
- Rangkuman Materi: ${moduleData.ai_summary || moduleData.deskripsi || moduleData.catatan || "Dasar topik materi"}

Wajib balas HANYA dengan JSON valid (tanpa bungkus markdown codeblock). Format struktur JSON:
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

  const systemInstruction = "Kamu pembuat soal ujian universitas profesional. Format kuis harus JSON valid dengan 5 soal.";
  const rawResponse = await callGemini(prompt, systemInstruction);

  let questions: QuizQuestion[] = [];
  try {
    const cleaned = rawResponse.replace(/`json/g, "").replace(/`/g, "").trim();
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
// 3. AI CHATBOT (TUTOR CERDAS PERTEMUAN DENGAN LOGIKA MANUSIAWI & KONTEKS KUAT)
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

  // Fetch past conversation for context
  const { data: chatHistory } = await supabase
    .from("module_chats")
    .select("role, content")
    .eq("module_id", moduleId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(14);

  // Save user message
  await supabase.from("module_chats").insert({
    user_id: user.id,
    module_id: moduleId,
    role: "user",
    content: userMessage,
  });

  const formattedHistory: GeminiMessage[] = (chatHistory || []).map((c) => ({
    role: c.role === "assistant" ? "model" : "user",
    parts: [{ text: c.content }],
  }));

  formattedHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const systemPrompt = `
Kamu adalah "Dosen & Mentor Belajar Pribadi" mahasiswa di kampus untuk Mata Kuliah "${moduleData.courses?.nama_matkul || "Perkuliahan"}", Pertemuan ke-${moduleData.pertemuan}.

KONTEKS AKADEMIK MATERI INI:
- Topik Pertemuan: "${moduleData.topik}"
- Silabus & Deskripsi Modul: ${moduleData.deskripsi || "Tidak ada deskripsi"}
- Catatan Khusus Kuliah: ${moduleData.catatan || "Tidak ada catatan"}
- Ringkasan Esensi Materi: ${moduleData.ai_summary || "Tidak ada rangkuman"}
- Poin-poin Kunci Modul: ${moduleData.ai_key_points?.join("; ") || "Tidak ada poin"}
- Nama Dokumen Referensi: ${moduleData.file_name || "Tidak ada file"}

ATURAN DAN PROTOKOL KECERDASAN KAMU (SANGAT PENTING):
1. **PEMAHAMAN MAKSUD MAHASISWA (INTENT RESOLVER)**:
   - Jika mahasiswa bertanya dengan kata-kata singkat, santai, gaul, atau kurang detail (misalnya cuma nanya: "maksudnya gimana bro?", "kasih contoh dong", "bagian sorting bingung", "rumusnya apa?"), KAMU HARUS SANGAT PINTAR MENANGKAP KONTEKS topik pertemuan "${moduleData.topik}" dan langsung hubungkan ke materi yang relevan tanpa meminta mereka mengulang pertanyaan!
2. **BAHASA MANUSIAWI, ALAMI & TIDAK KAKU**:
   - Gunakan bahasa Indonesia yang luwes, bersahabat, cerdas, seperti kakak tingkat berprestasi atau dosen muda favorit di kampus.
   - Hindari bahasa robot yang kaku atau template basi.
3. **STRUKTUR JAWABAN YANG RAPI & ENAK DIBACA**:
   - Jangan menulis satu paragraf raksasa yang bikin mata lelah.
   - Gunakan poin-poin tebal (**bold**), bullet points, dan spasi antar-paragraf yang rapi.
   - Buat penjelasan ringkas tapi padat langsung menjawab inti masalah (to the point).
4. **FOKUS & TETAP DALAM KONTEKS (ANTI-NGELANTUR)**:
   - Jawaban WAJIB bersumber dan berakar pada topik pertemuan "${moduleData.topik}" dan mata kuliah "${moduleData.courses?.nama_matkul}".
   - Jika mahasiswa bertanya hal di luar materi kuliah ini, ingatkan dengan sopan dan kembalikan fokus ke materi pertemuan ini.
5. **BERIKAN ANALOGI NYATA**:
   - Jika menjelaskan konsep teori atau rumus rumit, selalu sertakan 1 analogi kehidupan sehari-hari atau contoh kasus nyata agar mahasiswa langsung "Aha! Paham!".
`;

  const botReply = await callGeminiChat(formattedHistory, systemPrompt);

  // Save assistant reply
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
