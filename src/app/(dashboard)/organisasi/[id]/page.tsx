import { notFound } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { OrganizationDetailView } from "@/components/organizations/organization-detail-view";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [
    { data: organization },
    { data: positions },
    { data: programs },
    { data: orgActivities },
    { data: semesters },
    { data: allOrgs },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("organization_positions")
      .select("*")
      .eq("organization_id", id)
      .order("mulai", { ascending: false }),
    supabase
      .from("programs")
      .select("*")
      .eq("organization_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("id,judul,status,deadline,program_id,prioritas")
      .eq("organization_id", id),
    supabase
      .from("semesters")
      .select("id,nama_semester,is_active")
      .order("tanggal_mulai", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi").order("nama_organisasi"),
  ]);

  if (!organization) notFound();

  const mappedSemesters = (semesters || []).map((s) => ({
    id: s.id,
    name: s.nama_semester,
    active: s.is_active,
  }));
  const mappedOrgs = (allOrgs || []).map((o) => ({ id: o.id, name: o.nama_organisasi }));
  const mappedPrograms = (programs || []).map((p) => ({
    id: p.id,
    name: p.nama_proker,
    organization_id: id,
  }));

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <OrganizationDetailView
        organization={organization}
        positions={positions || []}
        programs={programs || []}
        activities={orgActivities || []}
        mappedSemesters={mappedSemesters}
        mappedOrgs={mappedOrgs}
        mappedPrograms={mappedPrograms}
      />
    </div>
  );
}
