"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Categories that default to is_portfolio = true
const PORTFOLIO_DEFAULT_CATEGORIES = ["lomba", "event", "organisasi"];

const schema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi.").max(180),
  deskripsi: z.string().trim().max(3000).default(""),
  kategori: z.enum(["kuliah", "organisasi", "lomba", "event", "lainnya"]),
  jenis_item: z.enum(["tugas", "reminder", "catatan"]),
  prioritas: z.enum(["rendah", "sedang", "tinggi"]),
  tanggal_mulai: z.string().date().or(z.literal("")).nullable().optional(),
  deadline_status: z.enum(["terjadwal", "belum_ditentukan"]),
  deadline: z.string().date().or(z.literal("")).nullable().optional(),
  jam_deadline: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam deadline tidak valid.").or(z.literal("")).nullable().optional(),
  semester_id: z.string().uuid().or(z.literal("")).nullable().optional(),
  organization_id: z.string().uuid().or(z.literal("")).nullable().optional(),
  program_id: z.string().uuid().or(z.literal("")).nullable().optional(),
  course_id: z.string().uuid().or(z.literal("")).nullable().optional(),
  is_portfolio: z.boolean().optional().default(false),
  peran_portfolio: z.string().trim().max(120).or(z.literal("")).nullable().optional(),
}).superRefine((value, context) => {
  if (value.deadline_status === "terjadwal" && !value.deadline) context.addIssue({ code: z.ZodIssueCode.custom, path: ["deadline"], message: "Tanggal deadline wajib diisi." });
  if (value.deadline_status === "belum_ditentukan" && (value.deadline || value.jam_deadline)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["deadline_status"], message: "Item tanpa deadline tidak boleh memiliki tanggal atau jam deadline." });
  if (value.tanggal_mulai && value.deadline && value.tanggal_mulai > value.deadline) context.addIssue({ code: z.ZodIssueCode.custom, path: ["deadline"], message: "Deadline harus setelah tanggal mulai." });
});
const statusSchema = z.enum(["belum_mulai", "on_progress", "selesai"]);

function parseActivity(formData: FormData) {
  const kategori = formData.get("kategori") as string;
  // Smart default: portfolio on for lomba/event/organisasi, off for others
  const isPortfolioRaw = formData.get("is_portfolio");
  let isPortfolio: boolean;
  if (isPortfolioRaw !== null) {
    isPortfolio = isPortfolioRaw === "true" || isPortfolioRaw === "1";
  } else {
    isPortfolio = PORTFOLIO_DEFAULT_CATEGORIES.includes(kategori);
  }

  return schema.parse({
    judul: formData.get("judul"),
    deskripsi: formData.get("deskripsi") || "",
    kategori,
    jenis_item: formData.get("jenis_item"),
    prioritas: formData.get("prioritas"),
    tanggal_mulai: formData.get("tanggal_mulai") || "",
    deadline_status: formData.get("deadline_status"),
    deadline: formData.get("deadline") || "",
    jam_deadline: formData.get("jam_deadline") || "",
    semester_id: formData.get("semester_id") || "",
    organization_id: formData.get("organization_id") || "",
    program_id: formData.get("program_id") || "",
    course_id: formData.get("course_id") || "",
    is_portfolio: isPortfolio,
    peran_portfolio: formData.get("peran_portfolio") || "",
  });
}

async function resolveOrganizationId(item: z.infer<typeof schema>, supabase: Awaited<ReturnType<typeof createClient>>) {
  let organizationId = item.organization_id || null;
  if (item.program_id) {
    const { data: program, error: programError } = await supabase.from("programs").select("organization_id").eq("id", item.program_id).single();
    if (programError || !program) throw new Error("Program kerja tidak ditemukan atau tidak dapat diakses.");
    if (organizationId && organizationId !== program.organization_id) throw new Error("Program kerja harus berasal dari organisasi yang sama.");
    organizationId = program.organization_id;
  }
  return organizationId;
}

function activityPayload(item: z.infer<typeof schema>, organizationId: string | null) {
  return {
    ...item,
    deskripsi: item.deskripsi || null,
    tanggal_mulai: item.tanggal_mulai || null,
    deadline: item.deadline || null,
    jam_deadline: item.jam_deadline || null,
    semester_id: item.semester_id || null,
    organization_id: organizationId,
    program_id: item.program_id || null,
    course_id: item.course_id || null,
    peran_portfolio: item.peran_portfolio || null,
  };
}

async function getSignedInClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

function refreshActivityPages() {
  revalidatePath("/kegiatan");
  revalidatePath("/dashboard");
  revalidatePath("/rekap");
  revalidatePath("/rekap/portfolio");
}

export async function createActivity(formData: FormData) {
  const item = parseActivity(formData);
  const { supabase, user } = await getSignedInClient();
  const organizationId = await resolveOrganizationId(item, supabase);
  const { error } = await supabase.from("activities").insert({ ...activityPayload(item, organizationId), user_id: user.id });
  if (error) throw new Error(error.message);
  refreshActivityPages();
}

export async function updateActivity(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const item = parseActivity(formData);
  const { supabase, user } = await getSignedInClient();
  const organizationId = await resolveOrganizationId(item, supabase);
  const { error } = await supabase.from("activities").update(activityPayload(item, organizationId)).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshActivityPages();
}

/**
 * Toggle portfolio status of an activity directly
 */
export async function togglePortfolio(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const is_portfolio = formData.get("is_portfolio") === "true";
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("activities").update({ is_portfolio }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshActivityPages();
}

/**
 * Toggle status antara selesai dan status sebelumnya
 */
export async function completeActivity(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await getSignedInClient();

  const { data: currentItem } = await supabase
    .from("activities")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const nextStatus = currentItem?.status === "selesai" ? "belum_mulai" : "selesai";

  const { error } = await supabase
    .from("activities")
    .update({ status: nextStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  refreshActivityPages();
}

export async function updateActivityStatus(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const status = statusSchema.parse(formData.get("status"));
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("activities").update({ status }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshActivityPages();
}

export async function deleteActivity(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user } = await getSignedInClient();
  const { error } = await supabase.from("activities").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  refreshActivityPages();
}
