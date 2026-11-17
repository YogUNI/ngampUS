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
  X,
  Building2,
  Globe,
  Calendar
} from "lucide-react";
import { 
  createBroadcastAnnouncement, 
  toggleAnnouncementStatus, 
  deleteBroadcastAnnouncement 
} from "../actions";
import { UniversityCombobox } from "@/components/ui/university-combobox";

type Announcement = {
  id: string;
  judul: string;
  pesan: string;
  tipe: "info" | "update" | "warning" | "maintenance";
  target_university?: string | null;
  expires_at?: string | null;
  tautan: string | null;
  is_active: boolean;
  is_emergency_sticky?: boolean;
  created_at: string;
};

export function AnnouncementClientManager({
  initialAnnouncements,
}: {
  initialAnnouncements: Announcement[];
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [targetUniversity, setTargetUniversity] = useState("");
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
        setSuccessMessage("Status publikasi siaran berhasil diperbarui.");
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
        setErrorMessage(err.message || "Gagal membuat siaran pengumuman.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Executive Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pengumuman & Siaran Sistem
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-300">
              {announcements.filter((a) => a.is_active).length} Aktif
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Kirim pemberitahuan penting, info pembaruan versi, atau peringatan pemeliharaan ke dashboard mahasiswa.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition active:scale-[0.98] shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs font-medium text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-medium text-rose-400 animate-in fade-in">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <Megaphone size={32} className="mx-auto text-slate-500 mb-3" />
          <p className="text-sm font-medium text-slate-400">
            Belum ada siaran pengumuman. Buat pengumuman pertama Anda untuk disiarkan ke mahasiswa.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => {
            const badgeMeta = {
              info: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: Info },
              update: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: CheckCircle2 },
              warning: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: AlertTriangle },
              maintenance: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", icon: Wrench },
            }[a.tipe] || { bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700", icon: Info };

            const IconComponent = badgeMeta.icon;

            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-5 transition ${
                  a.is_active
                    ? "border-slate-800 bg-slate-900/50 shadow-xs hover:border-slate-700"
                    : "border-slate-800/60 bg-slate-950/40 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase ${badgeMeta.bg} ${badgeMeta.text} ${badgeMeta.border}`}
                      >
                        <IconComponent size={11} />
                        {a.tipe}
                      </span>
                      {a.is_emergency_sticky && (
                        <span className="rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-medium uppercase">
                          Sticky Darurat
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                          a.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {a.is_active ? "Tayang Aktif" : "Nonaktif"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {a.target_university ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          <Building2 size={10} />
                          <span>{a.target_university}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                          <Globe size={10} />
                          <span>Semua Kampus (Global)</span>
                        </span>
                      )}
                      {a.expires_at && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 font-mono">
                          <Calendar size={10} />
                          <span>Exp: {new Date(a.expires_at).toLocaleDateString("id-ID")}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-white">{a.judul}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                      {a.pesan}
                    </p>

                    {a.tautan && (
                      <a
                        href={a.tautan}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline pt-0.5"
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
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer active:scale-[0.98] ${
                        a.is_active
                          ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      <Power size={13} />
                      <span>{a.is_active ? "Nonaktifkan" : "Aktifkan"}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(a.id, a.judul)}
                      disabled={isPending}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Form ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Buat Siaran Pengumuman Baru</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pengumuman yang aktif akan langsung muncul di bar atas dashboard mahasiswa.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Judul Siaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="judul"
                  required
                  placeholder="Misal: Pemeliharaan Server Terjadwal ngampUS"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kategori Informasi
                </label>
                <select
                  name="tipe"
                  defaultValue="info"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none transition"
                >
                  <option value="info">Info Umum (Biru / Netral)</option>
                  <option value="update">Update Fitur Baru (Hijau)</option>
                  <option value="warning">Peringatan Penting (Kuning)</option>
                  <option value="maintenance">Maintenance / Gangguan (Merah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Isi Pesan Detail <span className="text-rose-400">*</span>
                </label>
                <textarea
                  name="pesan"
                  required
                  rows={4}
                  placeholder="Tuliskan isi pesan atau informasi detail untuk mahasiswa..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Kampus Penerima
                </label>
                <div className="space-y-1">
                  <UniversityCombobox
                    value={targetUniversity}
                    onChange={(val) => setTargetUniversity(val)}
                    placeholder="Semua Kampus (Kosongkan jika siaran global)"
                    inputClassName="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-medium text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <input type="hidden" name="target_university" value={targetUniversity} />
                  <p className="text-[11px] text-slate-400">
                    Kosongkan untuk menyiarkan ke semua mahasiswa di seluruh kampus.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Batas Waktu Tayang (Opsional)
                </label>
                <input
                  type="datetime-local"
                  name="expires_at"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pengumuman otomatis berhenti tayang setelah melewati batas waktu ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tautan Eksternal (Opsional)
                </label>
                <input
                  type="url"
                  name="tautan"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                  <label htmlFor="is_active" className="text-xs font-medium text-slate-200 cursor-pointer">
                    Langsung publikasikan sekarang (Status Aktif)
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="is_emergency_sticky"
                    name="is_emergency_sticky"
                    className="h-4 w-4 rounded accent-rose-500 mt-0.5"
                  />
                  <div>
                    <label htmlFor="is_emergency_sticky" className="text-xs font-medium text-rose-300 cursor-pointer flex items-center gap-1">
                      <span>Jadikan Banner Darurat Menempel (Emergency Sticky)</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Banner akan menempel di bagian paling atas layar mahasiswa dan tidak dapat di-dismiss hingga dinonaktifkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50 cursor-pointer active:scale-[0.98]"
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
