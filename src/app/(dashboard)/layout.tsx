import { redirect } from "next/navigation";
import { MobileTopbar, Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: activeSemester }] = await Promise.all([supabase.from("profiles").select("full_name").single(), supabase.from("semesters").select("nama_semester").eq("is_active", true).maybeSingle()]);
  const userName = profile?.full_name || user.email?.split("@")[0] || "Mahasiswa";
  const semesterName = activeSemester?.nama_semester;

  return (
    <main className="dashboard-shell min-h-screen">
      <MobileTopbar name={userName} activeSemester={semesterName}/>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="hidden md:block">
          <Sidebar name={userName} activeSemester={semesterName}/>
        </div>
        <section className="dashboard-content min-w-0 flex-1 pb-20 md:pb-0">{children}</section>
      </div>
    </main>
  );
}
