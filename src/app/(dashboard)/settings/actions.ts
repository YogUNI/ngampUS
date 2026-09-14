"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function normalizeSocialUrl(val: FormDataEntryValue | null): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Nama wajib diisi.").max(100),
  university: z.string().trim().max(160).optional().nullable(),
  major: z.string().trim().max(160).optional().nullable(),
  student_id: z.string().trim().max(50).optional().nullable(),
  angkatan: z.string().trim().max(4).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(280).optional().nullable(),
  linkedin: z
    .string()
    .trim()
    .url("Link LinkedIn harus berupa tautan yang valid.")
    .max(300)
    .optional()
    .nullable(),
  github: z
    .string()
    .trim()
    .url("Link GitHub harus berupa tautan yang valid.")
    .max(300)
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .trim()
    .refine(
      (val) =>
        val === "" ||
        /^https?:\/\//i.test(val) ||
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(val),
      { message: "Format foto profil harus berupa URL atau gambar yang valid." }
    )
    .optional()
    .nullable(),
});

export async function updateProfile(formData: FormData) {
  const rawData = {
    full_name: formData.get("full_name"),
    university: formData.get("university") || null,
    major: formData.get("major") || null,
    student_id: formData.get("student_id") || null,
    angkatan: formData.get("angkatan") || null,
    phone: formData.get("phone") || null,
    bio: formData.get("bio") || null,
    linkedin: normalizeSocialUrl(formData.get("linkedin")),
    github: normalizeSocialUrl(formData.get("github")),
    avatar_url: formData.get("avatar_url") || null,
  };

  const parseResult = profileSchema.safeParse(rawData);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || "Data profil tidak valid.";
    throw new Error(firstError);
  }

  const data = parseResult.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi berakhir. Silakan login kembali.");

  const { error } = await supabase
    .from("profiles")
    .update({
      ...data,
      linkedin: data.linkedin || null,
      github: data.github || null,
      avatar_url: data.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/dashboard", "layout");
}
