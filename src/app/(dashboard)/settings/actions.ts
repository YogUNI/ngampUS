"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const data = z.object({
    full_name:  z.string().trim().min(1, "Nama wajib diisi.").max(100),
    university: z.string().trim().max(160).optional().nullable(),
    major:      z.string().trim().max(160).optional().nullable(),
    student_id: z.string().trim().max(50).optional().nullable(),
    angkatan:   z.string().trim().max(4).optional().nullable(),
    phone:      z.string().trim().max(30).optional().nullable(),
    bio:        z.string().trim().max(280).optional().nullable(),
    linkedin:   z.string().trim().max(300).optional().nullable(),
    github:     z.string().trim().max(300).optional().nullable(),
    avatar_url: z.string().optional().nullable(),
  }).parse({
    full_name:  formData.get("full_name"),
    university: formData.get("university") || null,
    major:      formData.get("major") || null,
    student_id: formData.get("student_id") || null,
    angkatan:   formData.get("angkatan") || null,
    phone:      formData.get("phone") || null,
    bio:        formData.get("bio") || null,
    linkedin:   formData.get("linkedin") || null,
    github:     formData.get("github") || null,
    avatar_url: formData.get("avatar_url") || null,
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login kembali.");

  const { error } = await supabase.from("profiles").update(data).eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/dashboard", "layout");
}
