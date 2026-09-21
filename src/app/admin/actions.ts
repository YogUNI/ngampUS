"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi login berakhir. Silakan login kembali.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "superadmin") {
    throw new Error("Akses ditolak: Operasi ini hanya diizinkan untuk Superadmin.");
  }

  return { supabase, user };
}

const announcementSchema = z.object({
  judul: z.string().trim().min(2, "Judul pengumuman minimal 2 karakter.").max(200),
  pesan: z.string().trim().min(2, "Isi pesan minimal 2 karakter.").max(2000),
  tipe: z.enum(["info", "update", "warning", "maintenance"]).default("info"),
  tautan: z
    .string()
    .trim()
    .url("Format tautan harus berupa URL yang valid.")
    .regex(/^https?:\/\//i, "Tautan harus menggunakan protokol http:// atau https://.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  is_active: z.boolean().default(true),
});

export async function createBroadcastAnnouncement(formData: FormData) {
  const { supabase, user } = await requireSuperadmin();

  const validated = announcementSchema.parse({
    judul: formData.get("judul"),
    pesan: formData.get("pesan"),
    tipe: formData.get("tipe") || "info",
    tautan: formData.get("tautan") || null,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  });

  const { error } = await supabase.from("broadcast_announcements").insert({
    ...validated,
    author_id: user.id,
  });

  if (error) {
    throw new Error(error.message || "Gagal membuat pengumuman sistem.");
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function toggleAnnouncementStatus(id: string, currentStatus: boolean) {
  const { supabase } = await requireSuperadmin();

  const { error } = await supabase
    .from("broadcast_announcements")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Gagal mengubah status pengumuman.");
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function deleteBroadcastAnnouncement(id: string) {
  const { supabase } = await requireSuperadmin();

  const { error } = await supabase
    .from("broadcast_announcements")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Gagal menghapus pengumuman.");
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function updateUserRole(targetUserId: string, newRole: "student" | "superadmin") {
  const { supabase, user } = await requireSuperadmin();

  if (targetUserId === user.id && newRole !== "superadmin") {
    throw new Error("Kamu tidak dapat mencabut akses superadmin dari akun kamu sendiri.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(error.message || "Gagal memperbarui role akun mahasiswa.");
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
