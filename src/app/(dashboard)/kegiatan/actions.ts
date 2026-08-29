"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ judul: z.string().trim().min(1).max(180), kategori: z.enum(["kuliah", "organisasi", "lomba", "event", "lainnya"]), prioritas: z.enum(["rendah", "sedang", "tinggi"]), deadline: z.string().date(), semester_id: z.string().uuid().or(z.literal("")), organization_id: z.string().uuid().or(z.literal("")) });
export async function createActivity(formData: FormData) { const item = schema.parse({ judul: formData.get("judul"), kategori: formData.get("kategori"), prioritas: formData.get("prioritas"), deadline: formData.get("deadline"), semester_id: formData.get("semester_id"), organization_id: formData.get("organization_id") }); const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sesi berakhir."); const { error } = await supabase.from("activities").insert({ ...item, semester_id: item.semester_id || null, organization_id: item.organization_id || null, user_id: user.id }); if (error) throw new Error(error.message); revalidatePath("/kegiatan"); revalidatePath("/dashboard"); }
export async function completeActivity(formData: FormData) { const id = z.string().uuid().parse(formData.get("id")); const supabase = await createClient(); const { error } = await supabase.from("activities").update({ status: "selesai" }).eq("id", id); if (error) throw new Error(error.message); revalidatePath("/kegiatan"); revalidatePath("/dashboard"); }
