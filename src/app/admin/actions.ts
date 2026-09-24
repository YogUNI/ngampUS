"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAdminActivity } from "@/lib/audit-logger";
import { sanitizeString, sanitizeUrl } from "@/lib/security";

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
  target_university: z.string().trim().max(150).nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_emergency_sticky: z.boolean().default(false),
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

  const targetUnivRaw = formData.get("target_university");
  const expiresAtRaw = formData.get("expires_at");
  const rawTautan = formData.get("tautan");

  const validated = announcementSchema.parse({
    judul: sanitizeString(formData.get("judul"), 200),
    pesan: sanitizeString(formData.get("pesan"), 2000),
    tipe: formData.get("tipe") || "info",
    target_university: targetUnivRaw ? sanitizeString(String(targetUnivRaw), 150) || null : null,
    expires_at: expiresAtRaw ? new Date(String(expiresAtRaw)).toISOString() : null,
    is_emergency_sticky: formData.get("is_emergency_sticky") === "true" || formData.get("is_emergency_sticky") === "on",
    tautan: rawTautan ? sanitizeUrl(String(rawTautan)) ?? null : null,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  });

  const payload: Record<string, any> = {
    judul: validated.judul,
    pesan: validated.pesan,
    tipe: validated.tipe,
    tautan: validated.tautan,
    is_active: validated.is_active,
    author_id: user.id,
  };

  if (validated.target_university !== undefined) payload.target_university = validated.target_university;
  if (validated.expires_at !== undefined) payload.expires_at = validated.expires_at;
  if (validated.is_emergency_sticky !== undefined) payload.is_emergency_sticky = validated.is_emergency_sticky;

  const { error } = await supabase.from("broadcast_announcements").insert(payload);

  if (error) {
    // If error is about missing column (target_university/expires_at/is_emergency_sticky), retry with base payload
    if (error.message?.includes("column") || error.code === "PGRST204") {
      const { error: retryError } = await supabase.from("broadcast_announcements").insert({
        judul: validated.judul,
        pesan: validated.pesan,
        tipe: validated.tipe,
        tautan: validated.tautan,
        is_active: validated.is_active,
        author_id: user.id,
      });
      if (retryError) throw new Error(retryError.message || "Gagal membuat pengumuman.");
    } else {
      throw new Error(error.message || "Gagal membuat pengumuman sistem.");
    }
  }

  // Record Audit Trail
  await logAdminActivity({
    actionType: "CREATE_ANNOUNCEMENT",
    description: `Membuat broadcast pengumuman "${validated.judul}" (Tipe: ${validated.tipe}${validated.target_university ? `, Target: ${validated.target_university}` : ", Semua Mahasiswa"})`,
    details: { judul: validated.judul, tipe: validated.tipe, target: validated.target_university, sticky: validated.is_emergency_sticky },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function updateSystemSetting(key: string, value: boolean): Promise<{ success: boolean; error?: string }> {
  // Allowlist valid setting keys — never trust arbitrary strings from the client
  const ALLOWED_KEYS = ["maintenance_mode", "ai_service_active", "registration_active"] as const;
  type AllowedKey = (typeof ALLOWED_KEYS)[number];
  if (!ALLOWED_KEYS.includes(key as AllowedKey)) {
    return { success: false, error: `Kunci pengaturan "${key}" tidak dikenali.` };
  }

  try {
    const { supabase, user } = await requireSuperadmin();

    // Upsert into system_settings table
    const { error } = await supabase.from("system_settings").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by_email: user.email,
      },
      { onConflict: "key" }
    );

    if (error) {
      return { success: false, error: error.message || `Gagal memperbarui pengaturan ${key}.` };
    }

    // Record Audit Trail
    await logAdminActivity({
      actionType: "TOGGLE_SYSTEM_SETTING",
      description: `Mengubah saklar sistem "${key}" menjadi: ${value ? "AKTIF (ON)" : "NONAKTIF (OFF)"}`,
      details: { setting_key: key, next_value: value },
    });

    revalidatePath("/admin/system-controls");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/login");
    revalidatePath("/register");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || `Terjadi kesalahan saat memperbarui ${key}.` };
  }
}

export async function toggleAnnouncementStatus(id: string, currentStatus: boolean) {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) throw new Error("ID pengumuman tidak valid.");

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

  // Record Audit Trail
  await logAdminActivity({
    actionType: "TOGGLE_ANNOUNCEMENT",
    description: `Mengubah status broadcast ID ${id} menjadi: ${!currentStatus ? "AKTIF" : "NONAKTIF"}`,
    details: { announcement_id: id, is_active: !currentStatus },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function deleteBroadcastAnnouncement(id: string) {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) throw new Error("ID pengumuman tidak valid.");

  const { supabase } = await requireSuperadmin();

  const { error } = await supabase
    .from("broadcast_announcements")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Gagal menghapus pengumuman.");
  }

  // Record Audit Trail
  await logAdminActivity({
    actionType: "DELETE_ANNOUNCEMENT",
    description: `Menghapus broadcast pengumuman ID ${id}`,
    details: { announcement_id: id },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function updateUserRole(targetUserId: string, newRole: "student" | "superadmin") {
  // Validate UUID format — prevents ID injection attacks
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(targetUserId)) {
    throw new Error("ID pengguna tidak valid.");
  }

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
    throw new Error(error.message || "Gagal memperbarui role akun.");
  }

  // Record Audit Trail
  await logAdminActivity({
    actionType: "UPDATE_USER_ROLE",
    description: `Mengubah role akun ID ${targetUserId} menjadi "${newRole}"`,
    details: { target_user_id: targetUserId, new_role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function fetchFreshWebAnalytics(days: number = 7) {
  await requireSuperadmin();
  const { getWebAnalyticsData } = await import("@/lib/web-telemetry");
  return await getWebAnalyticsData(days);
}

