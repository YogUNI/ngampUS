"use client";

import { useState, useTransition } from "react";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Wrench, 
  ExternalLink,
  Power,
  Loader2,
  X
} from "lucide-react";
import { 
  createBroadcastAnnouncement, 
  toggleAnnouncementStatus, 
  deleteBroadcastAnnouncement 
} from "../actions";

type Announcement = {
  id: string;
  judul: string;
  pesan: string;
  tipe: "info" | "update" | "warning" | "maintenance";
  tautan: string | null;
  is_active: boolean;
  created_at: string;
};

export function AnnouncementClientManager({
  initialAnnouncements,
}: {
  initialAnnouncements: Announcement[];
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggle = (id: string, currentStatus: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        await toggleAnnouncementStatus(id, currentStatus);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_active: !currentStatus } : a))
        );
        setSuccessMessage("Status publikasi pengumuman berhasil diubah.");
      } catch (err: any) {
        setErrorMessage(err.message || "Gagal mengubah status pengumuman.");
      }
    });
  };

  const handleDelete = (id: string, judul: string) => {
    if (!window.confirm(`Hapus pengumuman "${judul}" secara permanen?`)) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        await deleteBroadcastAnnouncement(id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setSuccessMessage("Pengumuman berhasil dihapus.");
      } catch (err: any) {
        setErrorMessage(err.message || "Gagal menghapus pengumuman.");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createBroadcastAnnouncement(formData);
        setShowModal(false);
        setSuccessMessage("Pengumuman berhasil disiarkan ke seluruh platform!");
        window.location.reload();
      } catch (err: any) {
        setErrorMessage(err.message || "Gagal membuat pengumuman.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
              [BROADCAST SYSTEM // GLOBAL BANNERS]
            </span>
            <span className="rounded-full bg-[#1b4332] px-2 py-0.5 text-[10px] font-bold text-[#c8ef70]">
              {announcements.filter((a) => a.is_active).length} Aktif
            </span>
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pengumuman & Siaran Sistem
          </h1>
          <p className="mt-1 text-xs text-[#9dc5aa]">
            Kirim pemberitahuan penting, info pembaruan versi, atau peringatan maintenance ke dashboard mahasiswa.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8ef70] px-4 py-2.5 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Plus size={16} />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/50 p-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/50 p-3 text-xs font-bold text-rose-400">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#183929] bg-[#0c2419]/40 p-12 text-center">
          <Megaphone size={36} className="mx-auto text-[#4d705c] mb-3" />
          <p className="text-sm font-bold text-[#789a84]">
            Belum ada siaran pengumuman. Buat pengumuman pertama Anda untuk ditampilkan ke seluruh mahasiswa.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => {
            const badgeMeta = {
              info: { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-500/30", icon: Info },
              update: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30", icon: CheckCircle2 },
              warning: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30", icon: AlertTriangle },
              maintenance: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/30", icon: Wrench },
            }[a.tipe] || { bg: "bg-white/10", text: "text-white", border: "border-white/20", icon: Info };

            const IconComponent = badgeMeta.icon;

            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 sm:p-5 transition ${
                  a.is_active
                    ? "border-[#204c37] bg-[#0c2419]/90 shadow-sm"
                    : "border-white/5 bg-[#081811]/40 opacity-70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeMeta.bg} ${badgeMeta.text} ${badgeMeta.border}`}
                      >
                        <IconComponent size={12} />
                        {a.tipe}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          a.is_active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {a.is_active ? "Tayang Aktif" : "Nonaktif"}
                      </span>
                      <span className="text-[11px] text-[#557763]">
                        {new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{a.judul}</h3>
                    <p className="text-xs text-[#9dc5aa] leading-relaxed whitespace-pre-line">
                      {a.pesan}
                    </p>

                    {a.tautan && (
                      <a
                        href={a.tautan}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#c8ef70] hover:underline pt-1"
                      >
                        <ExternalLink size={12} />
                        <span>{a.tautan}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleToggle(a.id, a.is_active)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        a.is_active
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          : "border-[#2b5d44] bg-[#183929] text-[#c8ef70] hover:bg-[#204c37]"
                      }`}
                    >
                      <Power size={13} />
                      <span>{a.is_active ? "Nonaktifkan" : "Aktifkan"}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(a.id, a.judul)}
                      disabled={isPending}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#204c37] bg-[#0c2419] p-6 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-[#789a84] hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono font-black text-[#c8ef70] uppercase">
              <Megaphone size={16} />
              <span>[NEW BROADCAST]</span>
            </div>
            <h2 className="mt-1 text-xl font-black text-white">Buat Siaran Pengumuman Baru</h2>
            <p className="text-xs text-[#9dc5aa] mt-1">
              Pengumuman yang aktif akan langsung muncul di bar paling atas Dashboard Mahasiswa.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Judul Siaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="judul"
                  required
                  placeholder="Misal: Maintenance Terjadwal Server ngampUS"
                  className="w-full rounded-xl border border-white/10 bg-[#071710] px-3 py-2 text-xs font-bold text-white focus:border-[#c8ef70] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Tipe Informasi
                </label>
                <select
                  name="tipe"
                  defaultValue="info"
                  className="w-full rounded-xl border border-white/10 bg-[#071710] px-3 py-2 text-xs font-bold text-white focus:border-[#c8ef70] focus:outline-none transition"
                >
                  <option value="info">Info Umum (Biru / Netral)</option>
                  <option value="update">Update Fitur Baru (Hijau)</option>
                  <option value="warning">Peringatan Penting (Kuning)</option>
                  <option value="maintenance">Maintenance / Gangguan (Merah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Isi Pesan Detail <span className="text-rose-400">*</span>
                </label>
                <textarea
                  name="pesan"
                  required
                  rows={4}
                  placeholder="Jelaskan pesan atau instruksi untuk mahasiswa..."
                  className="w-full rounded-xl border border-white/10 bg-[#071710] px-3 py-2 text-xs text-white placeholder:text-[#557763] focus:border-[#c8ef70] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Tautan Tambahan (Opsional)
                </label>
                <input
                  type="url"
                  name="tautan"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-[#071710] px-3 py-2 text-xs font-bold text-white placeholder:text-[#557763] focus:border-[#c8ef70] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked
                  className="h-4 w-4 rounded accent-[#c8ef70]"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-white cursor-pointer">
                  Langsung publikasikan sekarang (Status Aktif)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c8ef70] px-5 py-2 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 size={13} className="animate-spin" />}
                  <span>Siarkan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
