import { notFound } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ModuleDetailClient, ModuleDetailData } from "@/components/modules/module-detail-client";
import { CourseOption } from "@/components/modules/module-form-modal";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch module with course data
  const { data: moduleData, error } = await supabase
    .from("course_modules")
    .select("*, courses(id, nama_matkul, kode_matkul, sks, warna_label, semester_id)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !moduleData) {
    notFound();
  }

  // Fetch all courses in the same semester for the edit modal
  let courses: CourseOption[] = [];
  if (moduleData.courses?.semester_id) {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, nama_matkul, kode_matkul, sks, warna_label, semester_id")
      .eq("semester_id", moduleData.courses.semester_id);
    courses = coursesData || [];
  }

  // Fetch latest quiz for this module if exists
  const { data: quizData } = await supabase
    .from("module_quizzes")
    .select("id, questions, skor_terakhir")
    .eq("module_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch existing chat history for this module
  const { data: chatHistory } = await supabase
    .from("module_chats")
    .select("role, content")
    .eq("module_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(20);

  const formattedChats = (chatHistory || []).map((c) => ({
    role: c.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: c.content,
  }));

  return (
    <ModuleDetailClient
      module={moduleData as ModuleDetailData}
      courses={courses}
      initialQuiz={quizData}
      initialChatHistory={formattedChats}
    />
  );
}
