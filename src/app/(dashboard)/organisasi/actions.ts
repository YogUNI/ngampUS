"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const organizationSchema = z.object({
  nama_organisasi: z.string().trim().min(1).max(140),
  tipe: z.enum(["organisasi", "ukm", "ukk", "kepanitiaan", "lainnya"]),
  periode_mulai: z.string().date().or(z.literal("")),
  periode_selesai: z.string().date().or(z.literal("")),
  catatan: z.string().trim().max(3000),
}).refine((value) => !value.periode_mulai || !value.periode_selesai || value.periode_selesai >= value.periode_mulai, { path: ["periode_selesai"], message: "Tanggal selesai harus setelah tanggal mulai." });

const positionSchema = z.object({
  organization_id: z.string().uuid(),
  divisi: z.string().trim().max(120),
  jabatan: z.string().trim().min(1).max(120),
  mulai: z.string().date().or(z.literal("")),
  selesai: z.string().date().or(z.literal("")),
}).refine((value) => !value.mulai || !value.selesai || value.selesai >= value.mulai, { path: ["selesai"], message: "Tanggal selesai harus setelah tanggal mulai." });

const programSchema = z.object({
  organization_id: z.string().uuid(),
  nama_proker: z.string().trim().min(1).max(140),
  peran: z.string().trim().max(120),
  deskripsi: z.string().trim().max(3000),
  tanggal_mulai: z.string().date().or(z.literal("")),
  tanggal_selesai: z.string().date().or(z.literal("")),
  status: z.enum(["perencanaan", "berjalan", "selesai", "dibatalkan"]),
}).refine((value) => !value.tanggal_mulai || !value.tanggal_selesai || value.tanggal_selesai >= value.tanggal_mulai, { path: ["tanggal_selesai"], message: "Tanggal selesai harus setelah tanggal mulai." });

async function getSignedInClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

function refreshOrganizationPages(organizationId?: string) {
  revalidatePath("/organisasi");
  revalidatePath("/kegiatan");
  revalidatePath("/dashboard");
  if (organizationId) revalidatePath(`/organisasi/${organizationId}`);
}

export async function createOrganization(formData: FormData) {
  const data = organizationSchema.parse({ nama_organisasi: formData.get("nama_organisasi"), tipe: formData.get("tipe"), periode_mulai: formData.get("periode_mulai"), periode_selesai: formData.get("periode_selesai"), catatan: formData.get("catatan") || "" });
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organizations").insert({ ...data, periode_mulai: data.periode_mulai || null, periode_selesai: data.periode_selesai || null, catatan: data.catatan || null, user_id: user.id });
  if (error) throw new Error(error.message);
  refreshOrganizationPages();
}

export async function updateOrganization(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const data = organizationSchema.parse({ nama_organisasi: formData.get("nama_organisasi"), tipe: formData.get("tipe"), periode_mulai: formData.get("periode_mulai"), periode_selesai: formData.get("periode_selesai"), catatan: formData.get("catatan") || "" });
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organizations").update({ ...data, periode_mulai: data.periode_mulai || null, periode_selesai: data.periode_selesai || null, catatan: data.catatan || null }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshOrganizationPages(id);
}

export async function deleteOrganization(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organizations").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshOrganizationPages(id);
}

export async function createPosition(formData: FormData) {
  const data = positionSchema.parse({ organization_id: formData.get("organization_id"), divisi: formData.get("divisi") || "", jabatan: formData.get("jabatan"), mulai: formData.get("mulai"), selesai: formData.get("selesai") });
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organization_positions").insert({ ...data, divisi: data.divisi || null, mulai: data.mulai || null, selesai: data.selesai || null, user_id: user.id });
  if (error) throw new Error(error.message);
  refreshOrganizationPages(data.organization_id);
}

export async function deletePosition(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const organizationId = z.string().uuid().parse(formData.get("organization_id"));
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organization_positions").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshOrganizationPages(organizationId);
}

export async function createProgram(formData: FormData) {
  const data = programSchema.parse({ organization_id: formData.get("organization_id"), nama_proker: formData.get("nama_proker"), peran: formData.get("peran") || "", deskripsi: formData.get("deskripsi") || "", tanggal_mulai: formData.get("tanggal_mulai"), tanggal_selesai: formData.get("tanggal_selesai"), status: formData.get("status") });
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("programs").insert({ ...data, peran: data.peran || null, deskripsi: data.deskripsi || null, tanggal_mulai: data.tanggal_mulai || null, tanggal_selesai: data.tanggal_selesai || null, user_id: user.id });
  if (error) throw new Error(error.message);
  refreshOrganizationPages(data.organization_id);
}

export async function updateProgram(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const data = programSchema.parse({ organization_id: formData.get("organization_id"), nama_proker: formData.get("nama_proker"), peran: formData.get("peran") || "", deskripsi: formData.get("deskripsi") || "", tanggal_mulai: formData.get("tanggal_mulai"), tanggal_selesai: formData.get("tanggal_selesai"), status: formData.get("status") });
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("programs").update({ ...data, peran: data.peran || null, deskripsi: data.deskripsi || null, tanggal_mulai: data.tanggal_mulai || null, tanggal_selesai: data.tanggal_selesai || null }).eq("id", id).eq("organization_id", data.organization_id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshOrganizationPages(data.organization_id);
}

export async function deleteProgram(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const organizationId = z.string().uuid().parse(formData.get("organization_id"));
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("programs").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshOrganizationPages(organizationId);
}
