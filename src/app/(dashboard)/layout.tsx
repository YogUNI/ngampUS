import { redirect } from "next/navigation";
import { MobileTopbar, Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name").single();
  return <main className="min-h-screen bg-[#f7f8f5]"><MobileTopbar/><div className="mx-auto flex min-h-screen max-w-[1600px]"><div className="hidden md:block"><Sidebar name={profile?.full_name || user.email?.split("@")[0] || "Mahasiswa"}/></div><section className="min-w-0 flex-1">{children}</section></div></main>;
}
