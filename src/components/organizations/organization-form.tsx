"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Building2, Camera, Crop, Info, Plus, Trash2, Upload, X } from "lucide-react";
import { createOrganization } from "@/app/(dashboard)/organisasi/actions";
import { useToast } from "@/components/ui/toast-provider";
import { ImageCropModal } from "@/components/settings/image-crop-modal";

const roleOptions = [
  ["ketua_umum", "Ketua Umum"],
  ["wakil_ketua_umum", "Wakil Ketua Umum"],
  ["sekretaris", "Sekretaris"],
  ["bendahara", "Bendahara"],
  ["kepala_departemen", "Kepala Departemen"],
  ["wakil_kepala_departemen", "Wakil Kepala Departemen"],
  ["anggota", "Anggota"],
  ["lainnya", "Lainnya"],
] as const;

function capitalizeFirst(value: string) {
  return value ? value.charAt(0).toLocaleUpperCase("id-ID") + value.slice(1) : value;
}

export function OrganizationForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<(typeof roleOptions)[number][0]>("anggota");
  const [department, setDepartment] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();
  const needsDepartment =
    role === "kepala_departemen" || role === "wakil_kepala_departemen" || role === "anggota";

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Pilih file gambar yang valid (PNG, JPG, WebP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran gambar maksimal 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSaveCroppedLogo(croppedDataUrl: string) {
    setLogoPreview(croppedDataUrl);
    showToast("Posisi dan potongan logo berhasil disesuaikan! ✨", "success");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (logoPreview) {
        formData.set("logo_url", logoPreview);
      }
      await createOrganization(formData);
      showToast("Organisasi & jabatan berhasil ditambahkan!", "success");
      setOpen(false);
      setDepartment("");
      setLogoPreview(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan organisasi.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-xs hover:bg-[var(--brand-dark)] transition active:scale-95"
      >
        <Plus size={17} /> Tambah organisasi
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-3xl border border-[var(--line)] bg-white p-4 sm:p-6 shadow-2xl pb-24 sm:pb-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--brand)]">ORGANISASI BARU</p>
                <h2 className="font-display mt-0.5 text-lg sm:text-2xl font-extrabold truncate">Tambahkan keterlibatanmu</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-[var(--ink)] transition shrink-0"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Logo Upload Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Logo Organisasi (Opsional)
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-dashed border-[var(--line)] bg-[#fafcfb]">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-2xs flex items-center justify-center">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Preview Logo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Building2 className="text-[var(--muted)]" size={26} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--ink)]">
                      {logoPreview ? "Logo terpilih" : "Unggah logo organisasi"}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5 truncate">
                      PNG, JPG, atau WebP (maks. 5MB)
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--ink)] shadow-2xs hover:bg-[#f7f8f5]"
                      >
                        <Camera size={13} className="text-[var(--brand)]" />
                        {logoPreview ? "Ganti Logo" : "Pilih File"}
                      </button>
                      {logoPreview && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRawImageSrc(logoPreview);
                              setIsCropModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--brand-dark)] shadow-2xs hover:bg-[#eef7f2]"
                          >
                            <Crop size={12} className="text-[var(--brand)]" /> Sesuaikan
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                </div>
              </div>

              <label className="block text-sm font-bold">
                Nama organisasi *
                <input
                  required
                  name="nama_organisasi"
                  placeholder="Contoh: BEM FASILKOM"
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 outline-none focus:border-[var(--brand)] text-sm"
                />
              </label>

              <label className="block text-sm font-bold">
                Tipe organisasi
                <select
                  name="tipe"
                  defaultValue="organisasi"
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--brand)] text-sm"
                >
                  <option value="organisasi">Organisasi Mahasiswa (BEM/HIMA)</option>
                  <option value="ukm">Unit Kegiatan Mahasiswa (UKM)</option>
                  <option value="ukk">Unit Kegiatan Khusus (UKK)</option>
                  <option value="kepanitiaan">Kepanitiaan Khusus</option>
                  <option value="lainnya">Lainnya / Komunitas</option>
                </select>
              </label>

              <section className="rounded-2xl border border-[#b9ddc6] bg-[#f3faf5] p-4">
                <div className="flex gap-2">
                  <Building2 size={18} className="mt-0.5 text-[var(--brand)]" />
                  <div>
                    <h3 className="text-sm font-extrabold">Peran utama kamu</h3>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
                      Role ini langsung dibuat sebagai jabatan pertama pada organisasi ini.
                    </p>
                  </div>
                </div>

                <label className="mt-3 block text-sm font-bold">
                  Jabatan
                  <select
                    name="role_type"
                    value={role}
                    onChange={(event) => setRole(event.target.value as typeof role)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--brand)] text-sm"
                  >
                    {roleOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {needsDepartment && (
                  <label className="mt-3 block text-sm font-bold">
                    Nama departemen
                    <input
                      required
                      name="divisi"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      onBlur={() => setDepartment((value) => capitalizeFirst(value.trim()))}
                      placeholder="Contoh: Departemen PSDM"
                      className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--brand)] text-sm"
                    />
                    <span className="mt-1.5 flex gap-1.5 text-xs font-normal leading-5 text-[var(--muted)]">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      Wajib diisi untuk{" "}
                      {role === "anggota"
                        ? "Anggota"
                        : roleOptions.find(([value]) => value === role)?.[1]}
                      . Awali huruf kapital, misal “Departemen Media Kreatif”.
                    </span>
                  </label>
                )}

                {role === "lainnya" && (
                  <label className="mt-3 block text-sm font-bold">
                    Nama jabatan
                    <input
                      required
                      name="jabatan_lainnya"
                      placeholder="Contoh: Koordinator Lapangan"
                      className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 outline-none focus:border-[var(--brand)] text-sm"
                    />
                  </label>
                )}
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold">
                  Mulai (opsional)
                  <input
                    name="periode_mulai"
                    type="date"
                    className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-sm font-bold">
                  Selesai (opsional)
                  <input
                    name="periode_selesai"
                    type="date"
                    className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm font-bold">
                Catatan (opsional)
                <textarea
                  name="catatan"
                  rows={3}
                  placeholder="Hal penting tentang keterlibatanmu, link drive, dll."
                  className="mt-1.5 w-full resize-none rounded-xl border border-[var(--line)] px-3 py-2.5 outline-none focus:border-[var(--brand)] text-sm"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--muted)] hover:bg-[#f7f8f5]"
                >
                  Batal
                </button>
                <button
                  disabled={loading}
                  className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan organisasi & jabatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Smart Logo Crop & Adjustment Modal ── */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleSaveCroppedLogo}
        title="Sesuaikan Logo Organisasi"
        subtitle="Atur orientasi (persegi/landscape/portrait), zoom, posisi, dan rotasi agar logo terlihat rapi."
        shape="rounded-rect"
        allowAspectRatioChange={true}
        defaultAspectRatio="square"
      />
    </>
  );
}
