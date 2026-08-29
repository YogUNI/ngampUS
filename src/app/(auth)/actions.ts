"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string };

const credentialsSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal terdiri dari 8 karakter."),
});

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) return { error: "Email ini belum dikonfirmasi. Cek inbox atau nonaktifkan Confirm email saat testing." };
    return { error: "Email atau password belum tepat. Coba lagi." };
  }
  redirect("/dashboard");
}

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.extend({ fullName: z.string().trim().min(2, "Masukkan nama lengkap minimal 2 karakter.").max(100) }).safeParse({
    fullName: formData.get("fullName"), email: formData.get("email"), password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { error: error.message };
  if (!data.session) return { error: "Akun dibuat, tetapi email masih perlu dikonfirmasi sebelum masuk." };
  redirect("/dashboard");
}
