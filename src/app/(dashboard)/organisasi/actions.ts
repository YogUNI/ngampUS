"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ nama_organisasi: z.string().trim().min(1).max(140), tipe: z.enum(["organisasi", "ukm", "ukk", "kepanitiaan", "lainnya"]), periode_mulai: z.string().date().or(z.literal("")), periode_selesai: z.string().date().or(z.literal("")), catatan: z.string().max(3000).optional() }).refine((v) => !v.periode_mulai || !v.periode_selesai || v.periode_selesai >= v.periode_mulai, { path: ["periode_selesai"], message: "Tanggal selesai harus setelah tanggal mulai." });

export async function createOrganization(formData: FormData) {
  const data = schema.parse({ nama_organisasi: formData.get("nama_organisasi"), tipe: formData.get("tipe"), periode_mulai: formData.get("periode_mulai"), periode_selesai: formData.get("periode_selesai"), catatan: formData.get("catatan") || undefined });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sesi berakhir.");
  const { error } = await supabase.from("organizations").insert({ ...data, periode_mulai: data.periode_mulai || null, periode_selesai: data.periode_selesai || null, user_id: user.id });
  if (error) throw new Error(error.message); revalidatePath("/organisasi");
}

export async function deleteOrganization(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id")); const supabase = await createClient(); const { error } = await supabase.from("organizations").delete().eq("id", id); if (error) throw new Error(error.message); revalidatePath("/organisasi"); revalidatePath("/dashboard");
}
