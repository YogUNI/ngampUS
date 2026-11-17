"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  Download,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  X
} from "lucide-react";
import { updateUserRole, toggleUserSuspension } from "../actions";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  university: string | null;
  major: string | null;
  student_id: string | null;
  angkatan: string | null;
  phone: string | null;
  created_at: string;
  role: "student" | "superadmin" | "suspended" | string;
};

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  q?: string;
  campus?: string;
};

export function AdminUserTableClient({ 
  initialUsers,
  pagination,
}: { 
  initialUsers: UserProfile[];
  pagination?: PaginationMeta;
}) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // Role Confirmation Modal State
  const [roleModal, setRoleModal] = useState<{
    isOpen: boolean;
    user: UserProfile;
    nextRole: "student" | "superadmin";
  } | null>(null);

  // Suspend Confirmation Modal State
  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    user: UserProfile;
    nextSuspendState: boolean;
  } | null>(null);

  const executeRoleChange = (user: UserProfile, nextRole: "student" | "superadmin") => {
    setActionError(null);
    setActionSuccess(null);
    setActiveUserId(user.id);

    startTransition(async () => {
      try {
        await updateUserRole(user.id, nextRole);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
        setActionSuccess(`Role untuk ${user.full_name || user.email} berhasil diubah ke ${nextRole.toUpperCase()}.`);
      } catch (err: any) {
        setActionError(err.message || "Gagal mengubah role user.");
      } finally {
        setActiveUserId(null);
        setRoleModal(null);
      }
    });
  };

  const executeSuspensionChange = (user: UserProfile, suspend: boolean) => {
    setActionError(null);
    setActionSuccess(null);
    setActiveUserId(user.id);

    startTransition(async () => {
      try {
        await toggleUserSuspension(user.id, suspend);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  role: suspend ? "suspended" : (u.role === "suspended" ? "student" : u.role),
                }
              : u
          )
        );
        setActionSuccess(
          `Akun ${user.full_name || user.email} berhasil ${
            suspend ? "DITANGGUHKAN" : "DIAKTIFKAN KEMBALI"
          }.`
        );
      } catch (err: any) {
        setActionError(err.message || "Gagal mengubah status penangguhan akun.");
      } finally {
        setActiveUserId(null);
        setSuspendModal(null);
      }
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Nama",
      "Email",
      "Universitas",
      "Program Studi",
      "NIM",
      "Angkatan",
      "No HP",
      "Role",
      "Status Akun",
      "Terdaftar Pada",
    ];
    const rows = users.map((u) => [
      `"${(u.full_name || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${(u.university || "").replace(/"/g, '""')}"`,
      `"${(u.major || "").replace(/"/g, '""')}"`,
      `"${(u.student_id || "").replace(/"/g, '""')}"`,
      `"${(u.angkatan || "").replace(/"/g, '""')}"`,
      `"${(u.phone || "").replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.role === "suspended" ? "Suspended" : "Active"}"`,
      `"${new Date(u.created_at).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ngampus-mahasiswa-page-${pagination?.currentPage || 1}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buildPageHref = (pageNum: number) => {
    const params = new URLSearchParams();
    if (pagination?.q) params.set("q", pagination.q);
    if (pagination?.campus) params.set("campus", pagination.campus);
    params.set("page", String(pageNum));
    return `/admin/users?${params.toString()}`;
  };

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
        <p className="text-sm font-medium text-slate-400">
          Tidak ada data mahasiswa yang cocok dengan kriteria pencarian.
        </p>
      </div>
    );
  }

  const startRecord = pagination
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 1;
  const endRecord = pagination
    ? Math.min(pagination.totalCount, startRecord + users.length - 1)
    : users.length;

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs font-medium text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-medium text-rose-400 animate-in fade-in">
          <AlertCircle size={15} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Table Header Bar with CSV Export */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="text-xs text-slate-400">
          Menampilkan <span className="text-white font-medium">{startRecord} - {endRecord}</span> dari{" "}
          <span className="text-emerald-400 font-mono font-medium">{pagination?.totalCount ?? users.length}</span> akun
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer shadow-xs"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 font-medium text-[11px] text-slate-400">
              <tr>
                <th className="px-4 py-3">Mahasiswa</th>
                <th className="px-4 py-3">Kampus & Prodi</th>
                <th className="px-4 py-3">NIM & Angkatan</th>
                <th className="px-4 py-3">Terdaftar</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {users.map((u) => {
                const isSuper = u.role === "superadmin";
                const isSuspended = u.role === "suspended";
                const isProcessing = isPending && activeUserId === u.id;
                const regDate = new Date(u.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-100 text-sm">
                          {u.full_name || "Tanpa Nama"}
                        </div>
                        {isSuspended && (
                          <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.2 text-[9px] font-mono text-rose-400 uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Mail size={12} className="shrink-0 text-slate-500" />
                        <span className="truncate max-w-[200px]">{u.email || "-"}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <Phone size={10} className="shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Building2 size={13} className="shrink-0 text-emerald-400" />
                        <span>{u.university || "Belum Diatur"}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 pl-4">
                        {u.major || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-mono text-slate-200">
                        {u.student_id || "-"}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <GraduationCap size={12} className="shrink-0 text-slate-500" />
                        <span>{u.angkatan ? `Angkatan ${u.angkatan}` : "-"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Calendar size={12} className="shrink-0 text-slate-500" />
                        <span>{regDate}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-purple-300">
                          <ShieldAlert size={11} />
                          Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                          <ShieldCheck size={11} className="text-slate-400" />
                          Student
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Suspend / Unsuspend button */}
                        {!isSuper && (
                          <button
                            type="button"
                            onClick={() =>
                              setSuspendModal({
                                isOpen: true,
                                user: u,
                                nextSuspendState: !isSuspended,
                              })
                            }
                            disabled={isProcessing}
                            title={isSuspended ? "Aktifkan kembali akun ini" : "Tangguhkan akun ini"}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition active:scale-[0.98] cursor-pointer border ${
                              isSuspended
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20"
                            } disabled:opacity-50`}
                          >
                            {isSuspended ? <UserCheck size={12} /> : <Ban size={12} />}
                            <span className="hidden sm:inline">
                              {isSuspended ? "Unsuspend" : "Suspend"}
                            </span>
                          </button>
                        )}

                        {/* Role Switcher button */}
                        <button
                          type="button"
                          onClick={() =>
                            setRoleModal({
                              isOpen: true,
                              user: u,
                              nextRole: isSuper ? "student" : "superadmin",
                            })
                          }
                          disabled={isProcessing}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition active:scale-[0.98] cursor-pointer border ${
                            isSuper
                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
                              : "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 hover:text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Proses...</span>
                            </>
                          ) : isSuper ? (
                            <span>Set Student</span>
                          ) : (
                            <span>Set Admin</span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Server-Side Pagination Bar ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Halaman <span className="text-white font-medium">{pagination.currentPage}</span> dari{" "}
            <span className="text-slate-300 font-medium">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <Link
              href={buildPageHref(Math.max(1, pagination.currentPage - 1))}
              aria-disabled={pagination.currentPage <= 1}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                pagination.currentPage <= 1
                  ? "pointer-events-none opacity-40 border-slate-800 bg-transparent text-slate-500"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 active:scale-[0.98]"
              }`}
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </Link>

            {/* Quick Page Indicator pills */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let p = i + 1;
                if (pagination.totalPages > 5 && pagination.currentPage > 3) {
                  p = pagination.currentPage - 2 + i;
                  if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                }
                const isActive = p === pagination.currentPage;
                return (
                  <Link
                    key={p}
                    href={buildPageHref(p)}
                    className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-mono font-medium transition ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>

            {/* Next Button */}
            <Link
              href={buildPageHref(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              aria-disabled={pagination.currentPage >= pagination.totalPages}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                pagination.currentPage >= pagination.totalPages
                  ? "pointer-events-none opacity-40 border-slate-800 bg-transparent text-slate-500"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 active:scale-[0.98]"
              }`}
            >
              <span>Selanjutnya</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Role Confirmation Modal ── */}
      {roleModal && roleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                    roleModal.nextRole === "superadmin"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {roleModal.nextRole === "superadmin" ? (
                    <ShieldAlert size={20} />
                  ) : (
                    <GraduationCap size={20} />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {roleModal.nextRole === "superadmin"
                      ? "Promosikan ke Superadmin?"
                      : "Turunkan ke Mahasiswa?"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konfirmasi perubahan otorisasi akun
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRoleModal(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                Anda akan mengubah role akun:{" "}
                <strong className="text-white">{roleModal.user.full_name || roleModal.user.email}</strong>.
              </p>
              {roleModal.nextRole === "superadmin" ? (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-purple-200">
                  User akan mendapatkan akses ke seluruh panel Superadmin termasuk System Controls dan Audit Trail.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
                  User akan kembali menjadi akun mahasiswa biasa dan tidak dapat lagi membuka portal admin ini.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRoleModal(null)}
                className="rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeRoleChange(roleModal.user, roleModal.nextRole)}
                disabled={isPending}
                className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition active:scale-[0.98] ${
                  roleModal.nextRole === "superadmin"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPending ? "Memproses..." : "Konfirmasi Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Suspend Confirmation Modal ── */}
      {suspendModal && suspendModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                    suspendModal.nextSuspendState
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {suspendModal.nextSuspendState ? <Ban size={20} /> : <UserCheck size={20} />}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {suspendModal.nextSuspendState
                      ? "Tangguhkan Akun Mahasiswa?"
                      : "Aktifkan Kembali Akun?"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Status keamanan akun platform
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSuspendModal(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                Target akun:{" "}
                <strong className="text-white">{suspendModal.user.full_name || suspendModal.user.email}</strong>.
              </p>
              {suspendModal.nextSuspendState ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-200">
                  Akun yang ditangguhkan tidak akan dapat login atau mengakses seluruh layanan ngampUS hingga diaktifkan kembali.
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200">
                  Akun akan dipulihkan ke role mahasiswa normal dan dapat login kembali secara normal.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModal(null)}
                className="rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeSuspensionChange(suspendModal.user, suspendModal.nextSuspendState)}
                disabled={isPending}
                className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition active:scale-[0.98] ${
                  suspendModal.nextSuspendState
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPending ? "Memproses..." : suspendModal.nextSuspendState ? "Tangguhkan Akun" : "Aktifkan Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
