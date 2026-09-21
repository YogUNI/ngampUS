"use client";

import { useState, useTransition } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronDown,
  Download
} from "lucide-react";
import { updateUserRole } from "../actions";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  university: string | null;
  major: string | null;
  student_id: string | null;
  angkatan: string | null;
  phone: string | null;
  created_at: string;
  role: "student" | "superadmin" | string;
};

export function AdminUserTableClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const handleRoleToggle = (user: UserProfile) => {
    const nextRole = user.role === "superadmin" ? "student" : "superadmin";
    const confirmMessage =
      nextRole === "superadmin"
        ? `Jadikan ${user.full_name || user.email} sebagai Superadmin? User ini akan mendapatkan akses kontrol penuh.`
        : `Turunkan status ${user.full_name || user.email} kembali menjadi Mahasiswa (student)?`;

    if (!window.confirm(confirmMessage)) return;

    setActionError(null);
    setActionSuccess(null);
    setActiveUserId(user.id);

    startTransition(async () => {
      try {
        await updateUserRole(user.id, nextRole as "student" | "superadmin");
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
        setActionSuccess(`Role untuk ${user.full_name || user.email} berhasil diubah ke ${nextRole}.`);
      } catch (err: any) {
        setActionError(err.message || "Gagal mengubah role user.");
      } finally {
        setActiveUserId(null);
      }
    });
  };

  const handleExportCsv = () => {
    const headers = ["Nama", "Email", "Universitas", "Program Studi", "NIM", "Angkatan", "No HP", "Role", "Terdaftar Pada"];
    const rows = users.map((u) => [
      `"${(u.full_name || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${(u.university || "").replace(/"/g, '""')}"`,
      `"${(u.major || "").replace(/"/g, '""')}"`,
      `"${(u.student_id || "").replace(/"/g, '""')}"`,
      `"${(u.angkatan || "").replace(/"/g, '""')}"`,
      `"${(u.phone || "").replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${new Date(u.created_at).toISOString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ngampus-mahasiswa-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#183929] bg-[#0c2419]/40 p-12 text-center">
        <p className="text-sm font-bold text-[#789a84]">
          Tidak ada data mahasiswa yang cocok dengan kriteria pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast feedback */}
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/50 p-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/50 p-3 text-xs font-bold text-rose-400">
          <AlertCircle size={16} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Table Header Bar with CSV Export */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="text-xs text-[#9dc5aa] font-bold">
          Menampilkan <span className="text-white font-black">{users.length}</span> akun mahasiswa
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0c2419] px-3 py-2 text-xs font-bold text-[#c8ef70] hover:bg-[#143d2b] transition active:scale-95 cursor-pointer shadow-xs"
          title="Download data mahasiswa terfilter dalam format CSV"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="overflow-hidden rounded-2xl border border-[#183929] bg-[#0c2419]/90 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#071710] font-mono text-[10px] font-black uppercase tracking-wider text-[#789a84]">
              <tr>
                <th className="px-4 py-3.5">Mahasiswa</th>
                <th className="px-4 py-3.5">Kampus & Prodi</th>
                <th className="px-4 py-3.5">NIM & Angkatan</th>
                <th className="px-4 py-3.5">Terdaftar</th>
                <th className="px-4 py-3.5">Status Role</th>
                <th className="px-4 py-3.5 text-right">Opsi Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {users.map((u) => {
                const isSuper = u.role === "superadmin";
                const isProcessing = isPending && activeUserId === u.id;
                const regDate = new Date(u.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm">
                        {u.full_name || "Tanpa Nama"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8cb197] mt-0.5">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate max-w-[180px]">{u.email || "-"}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#557763] mt-0.5">
                          <Phone size={10} className="shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#b4d8c1]">
                        <Building2 size={13} className="shrink-0 text-[#c8ef70]" />
                        <span>{u.university || "Belum Mengatur"}</span>
                      </div>
                      <div className="text-[11px] text-[#789a84] mt-0.5 pl-4">
                        {u.major || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white">
                        {u.student_id || "-"}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#789a84] mt-0.5">
                        <GraduationCap size={12} className="shrink-0" />
                        <span>{u.angkatan ? `Angkatan ${u.angkatan}` : "-"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[#8cb197]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0 text-[#557763]" />
                        <span>{regDate}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#c8ef70]/40 bg-[#c8ef70]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                          <ShieldAlert size={11} />
                          Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-[#8cb197]">
                          <ShieldCheck size={11} />
                          Student
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={isProcessing}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                          isSuper
                            ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                            : "bg-[#183929] text-[#c8ef70] hover:bg-[#204c37] border border-[#2b5d44]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : isSuper ? (
                          <span>Turunkan ke Student</span>
                        ) : (
                          <span>Promote Superadmin</span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
