"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const courseSchema = z
  .object({
    semester_id: z.string().uuid("Semester wajib dipilih."),
    nama_matkul: z.string().trim().min(2, "Nama mata kuliah minimal 2 karakter.").max(120),
    kode_matkul: z.string().trim().max(25).or(z.literal("")).nullable().optional(),
    sks: z.coerce.number().int().min(1, "Minimal 1 SKS.").max(8, "Maksimal 8 SKS.").default(3),
    dosen_pengampu: z.string().trim().max(120).or(z.literal("")).nullable().optional(),
    kontak_dosen: z.string().trim().max(120).or(z.literal("")).nullable().optional(),
    hari: z.coerce.number().int().min(1).max(7),
    jam_mulai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam mulai tidak valid."),
    jam_selesai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam selesai tidak valid."),
    tipe_pertemuan: z.enum(["offline", "online", "hybrid"]).default("offline"),
    ruangan: z.string().trim().max(80).or(z.literal("")).nullable().optional(),
    link_pertemuan: z.string().trim().url("Link pertemuan harus URL valid.").or(z.literal("")).nullable().optional(),
    link_materi: z.string().trim().url("Link materi harus URL valid.").or(z.literal("")).nullable().optional(),
    warna_label: z.string().trim().max(20).default("#0f6849"),
    catatan: z.string().trim().max(1000).or(z.literal("")).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.jam_mulai && data.jam_selesai && data.jam_selesai <= data.jam_mulai) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jam_selesai"],
        message: "Jam selesai harus setelah jam mulai perkuliahan.",
      });
    }
  });

async function getSignedInUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

function refreshSchedulePages() {
  revalidatePath("/jadwal");
  revalidatePath("/dashboard");
  revalidatePath("/kegiatan");
}

function parseCourseFormData(formData: FormData) {
  return courseSchema.parse({
    semester_id: formData.get("semester_id"),
    nama_matkul: formData.get("nama_matkul"),
    kode_matkul: formData.get("kode_matkul") || null,
    sks: formData.get("sks"),
    dosen_pengampu: formData.get("dosen_pengampu") || null,
    kontak_dosen: formData.get("kontak_dosen") || null,
    hari: formData.get("hari"),
    jam_mulai: formData.get("jam_mulai"),
    jam_selesai: formData.get("jam_selesai"),
    tipe_pertemuan: formData.get("tipe_pertemuan") || "offline",
    ruangan: formData.get("ruangan") || null,
    link_pertemuan: formData.get("link_pertemuan") || null,
    link_materi: formData.get("link_materi") || null,
    warna_label: formData.get("warna_label") || "#0f6849",
    catatan: formData.get("catatan") || null,
  });
}

export async function createCourse(formData: FormData) {
  const data = parseCourseFormData(formData);
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase.from("courses").insert({
    ...data,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message || "Gagal menambahkan mata kuliah.");
  }

  refreshSchedulePages();
}

export async function updateCourse(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const data = parseCourseFormData(formData);
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase
    .from("courses")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Gagal memperbarui mata kuliah.");
  }

  refreshSchedulePages();
}

export async function deleteCourse(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Gagal menghapus mata kuliah.");
  }

  refreshSchedulePages();
}
