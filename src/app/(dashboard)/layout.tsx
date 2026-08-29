import { redirect } from "next/navigation";
import { MobileTopbar, Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: activeSemester }] = await Promise.all([supabase.from("profiles").select("full_name").single(), supabase.from("semesters").select("nama_semester").eq("is_active", true).maybeSingle()]);
  return <main className="dashboard-shell min-h-screen"><MobileTopbar/><div className="mx-auto flex min-h-screen max-w-[1600px]"><div className="hidden md:block"><Sidebar name={profile?.full_name || user.email?.split("@")[0] || "Mahasiswa"} activeSemester={activeSemester?.nama_semester}/></div><section className="dashboard-content min-w-0 flex-1">{children}</section></div></main>;
}
