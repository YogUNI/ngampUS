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
  ChevronDown,
  Download,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight
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
  is_suspended?: boolean | null;
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
                  is_suspended: suspend,
                  role: suspend ? "suspended" : (u.role === "suspended" ? "student" : u.role),
                }
              : u
          )
        );
        setActionSuccess(
          `Akun ${user.full_name || user.email} berhasil ${
            suspend ? "DITANGGUHKAN (SUSPEND)" : "DIAKTIFKAN KEMBALI"
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
      `"${u.is_suspended || u.role === "suspended" ? "Suspended" : "Active"}"`,
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
      <div className="rounded-2xl border border-dashed border-[#183929] bg-[#0c2419]/40 p-12 text-center">
        <p className="text-sm font-bold text-[#789a84]">
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
          Menampilkan <span className="text-white font-black">{startRecord} - {endRecord}</span> dari{" "}
          <span className="text-[#c8ef70] font-black">{pagination?.totalCount ?? users.length}</span> akun mahasiswa
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0c2419] px-3 py-2 text-xs font-bold text-[#c8ef70] hover:bg-[#143d2b] transition active:scale-95 cursor-pointer shadow-xs"
          title="Download data mahasiswa halaman ini dalam format CSV"
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
                const isSuspended = u.is_suspended === true || u.role === "suspended";
                const isProcessing = isPending && activeUserId === u.id;
                const regDate = new Date(u.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-white text-sm">
                          {u.full_name || "Tanpa Nama"}
                        </div>
                        {isSuspended && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[9px] font-black uppercase text-rose-400">
                            Suspended
                          </span>
                        )}
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
                      <div className="flex items-center justify-end gap-2">
                        {/* Suspend / Unsuspend button (only for non-superadmin accounts) */}
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
                            title={isSuspended ? "Aktifkan kembali akun ini" : "Tangguhkan (suspend) akun ini"}
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer border ${
                              isSuspended
                                ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20"
                            } disabled:opacity-50`}
                          >
                            {isSuspended ? <UserCheck size={13} /> : <Ban size={13} />}
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
          <div className="text-xs font-bold text-[#789a84]">
            Halaman <span className="text-white font-black">{pagination.currentPage}</span> dari{" "}
            <span className="text-[#c8ef70] font-black">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <Link
              href={buildPageHref(Math.max(1, pagination.currentPage - 1))}
              aria-disabled={pagination.currentPage <= 1}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                pagination.currentPage <= 1
                  ? "pointer-events-none opacity-40 border-white/5 bg-transparent text-[#789a84]"
                  : "border-white/10 bg-[#0c2419] text-[#b4d8c1] hover:bg-[#143d2b] active:scale-95"
              }`}
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </Link>

            {/* Quick Page Indicator pills */}
            <div className="flex items-center gap-1 px-2">
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
                    className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-black transition ${
                      isActive
                        ? "bg-[#c8ef70] text-[#103626] shadow-xs"
                        : "bg-white/5 text-[#8cb197] hover:bg-white/10 hover:text-white"
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
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                pagination.currentPage >= pagination.totalPages
                  ? "pointer-events-none opacity-40 border-white/5 bg-transparent text-[#789a84]"
                  : "border-white/10 bg-[#0c2419] text-[#b4d8c1] hover:bg-[#143d2b] active:scale-95"
              }`}
            >
              <span>Selanjutnya</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Custom Animated Role Confirmation Modal ── */}
      {roleModal && roleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#091e14] p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={`absolute top-0 inset-x-8 h-1 rounded-full ${
                roleModal.nextRole === "superadmin"
                  ? "bg-gradient-to-r from-transparent via-[#c8ef70] to-transparent"
                  : "bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              }`} 
            />

            <div className="flex items-start gap-4">
              <div 
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${
                  roleModal.nextRole === "superadmin"
                    ? "bg-[#c8ef70]/15 text-[#c8ef70] border-[#c8ef70]/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {roleModal.nextRole === "superadmin" ? (
                  <ShieldAlert size={24} className="animate-pulse" />
                ) : (
                  <GraduationCap size={24} />
                )}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                  MANAJEMEN HAK AKSES SISTEM
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-white">
                  {roleModal.nextRole === "superadmin"
                    ? "Promosikan ke Superadmin?"
                    : "Turunkan ke Mahasiswa?"}
                </h3>
              </div>
            </div>

            <div className="text-xs text-[#9dc5aa] space-y-2 leading-relaxed">
              <p>
                Anda akan mengubah role akun milik:{" "}
                <strong className="text-white">{roleModal.user.full_name || roleModal.user.email}</strong>.
              </p>
              {roleModal.nextRole === "superadmin" ? (
                <div className="rounded-2xl border border-[#c8ef70]/20 bg-[#c8ef70]/5 p-3 text-[11px] text-[#b4d8c1] space-y-1">
                  <span className="font-bold text-[#c8ef70]">⚠️ Peringatan Akses Root:</span>
                  <p>User ini akan memiliki akses penuh ke pusat kontrol sistem, AI gateway, broadcast pengumuman, dan data seluruh mahasiswa.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200 space-y-1">
                  <span className="font-bold text-amber-300">ℹ️ Pencabutan Hak Akses:</span>
                  <p>User ini akan kehilangan seluruh akses ke console Superadmin dan hanya dapat mengakses dashboard mahasiswa biasa.</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRoleModal(null)}
                disabled={isPending}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
              >
                Batalkan
              </button>

              <button
                type="button"
                onClick={() => executeRoleChange(roleModal.user, roleModal.nextRole)}
                disabled={isPending}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 ${
                  roleModal.nextRole === "superadmin"
                    ? "bg-[#c8ef70] text-[#103626] hover:bg-[#d8faa1] shadow-[#c8ef70]/20"
                    : "bg-amber-500 text-[#10261b] hover:bg-amber-400 shadow-amber-500/20"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengeksekusi...</span>
                  </>
                ) : (
                  <span>Konfirmasi & Terapkan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Animated Suspend/Unsuspend Confirmation Modal ── */}
      {suspendModal && suspendModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#091e14] p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={`absolute top-0 inset-x-8 h-1 rounded-full ${
                suspendModal.nextSuspendState
                  ? "bg-gradient-to-r from-transparent via-rose-500 to-transparent"
                  : "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
              }`} 
            />

            <div className="flex items-start gap-4">
              <div 
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${
                  suspendModal.nextSuspendState
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {suspendModal.nextSuspendState ? (
                  <Ban size={24} className="animate-pulse" />
                ) : (
                  <UserCheck size={24} />
                )}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                  MODERASI INTEGRITAS PENGGUNA
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-white">
                  {suspendModal.nextSuspendState
                    ? "Tangguhkan (Suspend) Akun?"
                    : "Aktifkan Kembali Akun?"}
                </h3>
              </div>
            </div>

            <div className="text-xs text-[#9dc5aa] space-y-2 leading-relaxed">
              <p>
                Target akun:{" "}
                <strong className="text-white">
                  {suspendModal.user.full_name || suspendModal.user.email}
                </strong>
                .
              </p>
              {suspendModal.nextSuspendState ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-[11px] text-rose-200 space-y-1">
                  <span className="font-bold text-rose-400">⛔ Dampak Penangguhan:</span>
                  <p>
                    Mahasiswa ini tidak akan dapat login ke dashboard ngampUS dan seluruh sesi aktifnya akan langsung dicegat oleh sistem keamanan.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-300">✅ Pemulihan Akses:</span>
                  <p>
                    Mahasiswa dapat kembali login dan menggunakan fitur akademik ngampUS seperti biasa.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSuspendModal(null)}
                disabled={isPending}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
              >
                Batalkan
              </button>

              <button
                type="button"
                onClick={() => executeSuspensionChange(suspendModal.user, suspendModal.nextSuspendState)}
                disabled={isPending}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 ${
                  suspendModal.nextSuspendState
                    ? "bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20"
                    : "bg-emerald-500 text-[#071710] hover:bg-emerald-400 shadow-emerald-500/20 font-black"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengeksekusi...</span>
                  </>
                ) : (
                  <span>
                    {suspendModal.nextSuspendState ? "Ya, Tangguhkan Akun" : "Ya, Aktifkan Akun"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
