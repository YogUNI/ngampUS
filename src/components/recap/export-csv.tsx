"use client";

import { Download } from "lucide-react";

type ExportActivity = { judul: string; jenis_item: string; kategori: string; status: string; prioritas: string; tanggal_mulai: string | null; deadline_status: string; deadline: string | null; jam_deadline: string | null; created_at: string };

function escapeCsv(value: string | null) {
  const normalized = value ?? "";
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function ExportCsv({ activities, fileName = "rekap-ngampus" }: { activities: ExportActivity[]; fileName?: string }) {
  function download() {
    const header = ["Judul", "Jenis", "Kategori", "Status", "Prioritas", "Tanggal mulai", "Status deadline", "Deadline", "Jam deadline", "Dibuat pada"];
    const rows = activities.map((activity) => [activity.judul, activity.jenis_item, activity.kategori, activity.status, activity.prioritas, activity.tanggal_mulai, activity.deadline_status, activity.deadline, activity.jam_deadline, activity.created_at].map((value) => escapeCsv(value)).join(","));
    const csv = `\uFEFF${header.map((value) => escapeCsv(value)).join(",")}\n${rows.join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <button onClick={download} disabled={!activities.length} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-50"><Download size={17}/> Ekspor CSV</button>;
}
