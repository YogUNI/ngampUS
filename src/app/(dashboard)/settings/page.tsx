import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").single(),
    supabase.auth.getUser(),
  ]);

  return <ProfileForm profile={profile} email={user?.email ?? ""} />;
}
