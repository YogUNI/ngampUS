"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const data = z.object({
    full_name: z.string().trim().min(1, "Nama wajib diisi.").max(100),
    university: z.string().trim().min(1, "Universitas wajib diisi.").max(160),
    major: z.string().trim().min(1, "Program studi wajib diisi.").max(160),
    student_id: z.string().trim().max(50),
    phone: z.string().trim().max(30),
    bio: z.string().trim().max(280),
  }).parse({
    full_name: formData.get("full_name"),
    university: formData.get("university"),
    major: formData.get("major"),
    student_id: formData.get("student_id"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
  });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sesi berakhir.");
  const { error } = await supabase.from("profiles").update(data).eq("id", user.id); if (error) throw new Error(error.message); revalidatePath("/settings"); revalidatePath("/dashboard", "layout");
}
