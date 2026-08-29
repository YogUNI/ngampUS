"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const semesterSchema = z.object({
  nama_semester: z.string().trim().min(1, "Nama semester wajib diisi.").max(80),
  tanggal_mulai: z.string().date("Tanggal mulai tidak valid."),
  tanggal_selesai: z.string().date("Tanggal selesai tidak valid."),
  is_active: z.boolean(),
}).refine((value) => value.tanggal_selesai >= value.tanggal_mulai, { path: ["tanggal_selesai"], message: "Tanggal selesai harus setelah tanggal mulai." });

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi tidak ditemukan. Silakan masuk kembali.");
  return { supabase, user };
}

export async function createSemester(formData: FormData) {
  const parsed = semesterSchema.safeParse({
    nama_semester: formData.get("nama_semester"),
    tanggal_mulai: formData.get("tanggal_mulai"),
    tanggal_selesai: formData.get("tanggal_selesai"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("semesters").insert({ ...parsed.data, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/semester");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
}

export async function updateSemester(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const parsed = semesterSchema.safeParse({
    nama_semester: formData.get("nama_semester"),
    tanggal_mulai: formData.get("tanggal_mulai"),
    tanggal_selesai: formData.get("tanggal_selesai"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("semesters").update(parsed.data).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/semester");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
}

export async function setActiveSemester(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("semesters").update({ is_active: true }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/semester");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
}

export async function deleteSemester(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("semesters").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/semester");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
}
