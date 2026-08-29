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

const roleTypeSchema = z.enum(["ketua_umum", "wakil_ketua_umum", "sekretaris", "bendahara", "kepala_departemen", "wakil_kepala_departemen", "anggota", "lainnya"]);
const departmentRoles = new Set(["kepala_departemen", "wakil_kepala_departemen", "anggota"]);
const roleLabels: Record<z.infer<typeof roleTypeSchema>, string> = {
  ketua_umum: "Ketua Umum",
  wakil_ketua_umum: "Wakil Ketua Umum",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  kepala_departemen: "Kepala Departemen",
  wakil_kepala_departemen: "Wakil Kepala Departemen",
  anggota: "Anggota",
  lainnya: "",
};

const initialRoleSchema = z.object({
  role_type: roleTypeSchema,
  divisi: z.string().trim().max(120),
  jabatan_lainnya: z.string().trim().max(120),
}).superRefine((value, context) => {
  if (departmentRoles.has(value.role_type) && !value.divisi) context.addIssue({ code: z.ZodIssueCode.custom, path: ["divisi"], message: "Nama departemen wajib diisi." });
  if (departmentRoles.has(value.role_type) && !/^[A-Z]/.test(value.divisi)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["divisi"], message: "Nama departemen harus diawali huruf kapital." });
  if (value.role_type === "lainnya" && !value.jabatan_lainnya) context.addIssue({ code: z.ZodIssueCode.custom, path: ["jabatan_lainnya"], message: "Tulis nama jabatanmu." });
});

const positionSchema = z.object({
  organization_id: z.string().uuid(),
  role_type: roleTypeSchema,
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

function parsePosition(formData: FormData) {
  const roleType = roleTypeSchema.parse(formData.get("role_type") || "lainnya");
  const data = positionSchema.parse({
    organization_id: formData.get("organization_id"),
    role_type: roleType,
    divisi: formData.get("divisi") || "",
    jabatan: roleType === "lainnya" ? formData.get("jabatan") : roleLabels[roleType],
    mulai: formData.get("mulai"),
    selesai: formData.get("selesai"),
  });
  if (departmentRoles.has(data.role_type) && !data.divisi) throw new Error("Nama departemen wajib diisi untuk role ini.");
  if (departmentRoles.has(data.role_type) && !/^[A-Z]/.test(data.divisi)) throw new Error("Nama departemen harus diawali huruf kapital.");
  return data;
}

export async function createOrganization(formData: FormData) {
  const data = organizationSchema.parse({ nama_organisasi: formData.get("nama_organisasi"), tipe: formData.get("tipe"), periode_mulai: formData.get("periode_mulai"), periode_selesai: formData.get("periode_selesai"), catatan: formData.get("catatan") || "" });
  const role = initialRoleSchema.parse({ role_type: formData.get("role_type"), divisi: formData.get("divisi") || "", jabatan_lainnya: formData.get("jabatan_lainnya") || "" });
  const { supabase } = await getSignedInClient();
  const { data: organizationId, error } = await supabase.rpc("create_organization_with_position", {
    p_nama_organisasi: data.nama_organisasi,
    p_tipe: data.tipe,
    p_periode_mulai: data.periode_mulai || null,
    p_periode_selesai: data.periode_selesai || null,
    p_catatan: data.catatan || null,
    p_role_type: role.role_type,
    p_jabatan: role.role_type === "lainnya" ? role.jabatan_lainnya : roleLabels[role.role_type],
    p_divisi: role.divisi || null,
  });
  if (error) throw new Error(error.message);
  refreshOrganizationPages(organizationId ?? undefined);
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
  const data = parsePosition(formData);
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organization_positions").insert({ ...data, divisi: data.divisi || null, mulai: data.mulai || null, selesai: data.selesai || null, user_id: user.id });
  if (error) throw new Error(error.message);
  refreshOrganizationPages(data.organization_id);
}

export async function updatePosition(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const data = parsePosition(formData);
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("organization_positions").update({ ...data, divisi: data.divisi || null, mulai: data.mulai || null, selesai: data.selesai || null }).eq("id", id).eq("organization_id", data.organization_id).eq("user_id", user.id);
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
