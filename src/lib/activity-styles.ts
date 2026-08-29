export const categoryStyles: Record<string, string> = {
  kuliah: "bg-[#e4efff] text-[#245a9a]",
  organisasi: "bg-[var(--brand-soft)] text-[var(--brand-dark)]",
  lomba: "bg-[#fff0cc] text-[#8a5d00]",
  event: "bg-[#eee5ff] text-[#7045a5]",
  lainnya: "bg-[#eef1ee] text-[#5e6b63]",
};

export const statusStyles: Record<string, string> = {
  belum_mulai: "bg-[#eef1ee] text-[#5e6b63]",
  on_progress: "bg-[#e4efff] text-[#245a9a]",
  selesai: "bg-[var(--brand-soft)] text-[var(--brand-dark)]",
};

export function categoryClass(category: string) { return categoryStyles[category] || categoryStyles.lainnya; }
export function statusClass(status: string) { return statusStyles[status] || statusStyles.belum_mulai; }
