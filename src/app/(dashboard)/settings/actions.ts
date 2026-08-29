"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const data = z.object({ full_name: z.string().trim().max(100), university: z.string().trim().max(160), major: z.string().trim().max(160) }).parse({ full_name: formData.get("full_name"), university: formData.get("university"), major: formData.get("major") });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sesi berakhir.");
  const { error } = await supabase.from("profiles").update(data).eq("id", user.id); if (error) throw new Error(error.message); revalidatePath("/settings");
}
