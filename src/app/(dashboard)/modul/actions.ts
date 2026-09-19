"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const moduleSchema = z.object({
  course_id: z.string().uuid("Pilih mata kuliah yang valid."),
  pertemuan: z.coerce.number().int().min(1, "Pertemuan minimal 1.").max(32, "Maksimal pertemuan 32."),
  topik: z.string().trim().min(2, "Topik materi minimal 2 karakter.").max(200, "Topik maksimal 200 karakter."),
  deskripsi: z.string().trim().max(1000).or(z.literal("")).nullable().optional(),
  link_modul: z
    .string()
    .trim()
    .max(800)
    .or(z.literal(""))
    .nullable()
    .optional(),
  link_tugas: z
    .string()
    .trim()
    .max(800)
    .or(z.literal(""))
    .nullable()
    .optional(),
  status: z.enum(["belum_baca", "sudah_baca", "dipelajari"]).default("belum_baca"),
  tanggal_pertemuan: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  catatan: z.string().trim().max(2000).or(z.literal("")).nullable().optional(),
  file_url: z.string().trim().or(z.literal("")).nullable().optional(),
  file_name: z.string().trim().max(255).or(z.literal("")).nullable().optional(),
  file_size: z.coerce.number().int().nonnegative().nullable().optional(),
  file_type: z.string().trim().max(100).or(z.literal("")).nullable().optional(),
});

async function getSignedInUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

function refreshModulePages() {
  revalidatePath("/modul");
  revalidatePath("/jadwal");
  revalidatePath("/dashboard");
}

function parseModuleFormData(formData: FormData) {
  return moduleSchema.parse({
    course_id: formData.get("course_id"),
    pertemuan: formData.get("pertemuan"),
    topik: formData.get("topik"),
    deskripsi: formData.get("deskripsi") || null,
    link_modul: formData.get("link_modul") || null,
    link_tugas: formData.get("link_tugas") || null,
    status: formData.get("status") || "belum_baca",
    tanggal_pertemuan: formData.get("tanggal_pertemuan") || null,
    catatan: formData.get("catatan") || null,
    file_url: formData.get("file_url") || null,
    file_name: formData.get("file_name") || null,
    file_size: formData.get("file_size") ? Number(formData.get("file_size")) : null,
    file_type: formData.get("file_type") || null,
  });
}

export async function createModule(formData: FormData) {
  const data = parseModuleFormData(formData);
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase.from("course_modules").insert({
    ...data,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message || "Gagal menyimpan modul perkuliahan.");
  }

  refreshModulePages();
}

export async function updateModule(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const data = parseModuleFormData(formData);
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase
    .from("course_modules")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Gagal memperbarui modul perkuliahan.");
  }

  refreshModulePages();
}

export async function deleteModule(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await getSignedInUser();

  // Check if there is an uploaded file to remove from storage
  const { data: moduleData } = await supabase
    .from("course_modules")
    .select("file_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (moduleData?.file_url) {
    try {
      const urlParts = moduleData.file_url.split("/course-materials/");
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from("course-materials").remove([filePath]);
      }
    } catch {
      // Ignore cleanup error, proceed to delete record
    }
  }

  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Gagal menghapus modul perkuliahan.");
  }

  refreshModulePages();
}

export async function updateModuleStatus(id: string, status: "belum_baca" | "sudah_baca" | "dipelajari") {
  const validStatus = z.enum(["belum_baca", "sudah_baca", "dipelajari"]).parse(status);
  const { supabase, user } = await getSignedInUser();

  const { error } = await supabase
    .from("course_modules")
    .update({
      status: validStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Gagal mengubah status baca modul.");
  }

  refreshModulePages();
}
