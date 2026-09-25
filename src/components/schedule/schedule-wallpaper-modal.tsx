"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Smartphone, X, Sparkles, Check, Loader2 } from "lucide-react";
import { CourseData } from "./course-form-modal";

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function ScheduleWallpaperModal({
  courses,
  semesterName = "Semester Akademik",
  studentName = "Mahasiswa",
  universityName = "ngampUS Command Center",
  isOpen,
  onClose,
}: {
  courses: (CourseData & { id: string })[];
  semesterName?: string;
  studentName?: string;
  universityName?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsGenerating(true);
    const timer = setTimeout(() => {
      renderWallpaperCanvas();
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, courses, semesterName, studentName, universityName]);

  const renderWallpaperCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile Wallpaper standard resolution 1080 x 1920 (9:16)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── 1. Background Gradient ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#06150e");
    bgGrad.addColorStop(0.5, "#0a2217");
    bgGrad.addColorStop(1, "#040e09");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow circles
    const radGlow1 = ctx.createRadialGradient(200, 300, 10, 200, 300, 600);
    radGlow1.addColorStop(0, "rgba(16, 185, 129, 0.15)");
    radGlow1.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, W, H);

    const radGlow2 = ctx.createRadialGradient(880, 1500, 10, 880, 1500, 600);
    radGlow2.addColorStop(0, "rgba(200, 239, 112, 0.08)");
    radGlow2.addColorStop(1, "rgba(200, 239, 112, 0)");
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, W, H);

    // Decorative grid pattern subtle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 60; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 60; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // ── 2. Top Lockscreen Clear Space (Leave room for phone clock & widgets) ──
    // Top 360px left spacious for lockscreen clock
    ctx.fillStyle = "rgba(200, 239, 112, 0.5)";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("• NGAMPUS TIMETABLE LOCKSCREEN •", W / 2, 380);

    // ── 3. Header Section (y: 420 - 540) ──
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(studentName || "Jadwal Kuliah", W / 2, 450);

    ctx.fillStyle = "#a8d5b8";
    ctx.font = "600 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${universityName} · ${semesterName}`, W / 2, 500);

    // Divider line
    ctx.strokeStyle = "rgba(200, 239, 112, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 530);
    ctx.lineTo(W - 140, 530);
    ctx.stroke();

    // ── 4. Render Schedule Day-by-Day Cards (y: 560 - 1760) ──
    const startY = 570;
    const contentH = 1200;
    const dayGap = 20;

    // Filter days that have courses or Monday-Friday by default
    const activeDays = [1, 2, 3, 4, 5].filter((d) => {
      // Include if Monday to Friday, or has Saturday courses
      return true;
    });

    const dayCardH = (contentH - (activeDays.length - 1) * dayGap) / activeDays.length;

    activeDays.forEach((dayNum, idx) => {
      const cardY = startY + idx * (dayCardH + dayGap);
      const dayCourses = courses.filter((c) => c.hari === dayNum).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
      const dayName = DAY_NAMES[dayNum - 1] || "Hari";

      // Card Background Glass
      ctx.fillStyle = dayCourses.length > 0 ? "rgba(12, 36, 25, 0.85)" : "rgba(10, 28, 20, 0.4)";
      ctx.strokeStyle = dayCourses.length > 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;

      // Rounded rect
      roundRect(ctx, 90, cardY, W - 180, dayCardH, 24);
      ctx.fill();
      ctx.stroke();

      // Day Badge on the left
      ctx.fillStyle = dayCourses.length > 0 ? "#c8ef70" : "#698b76";
      ctx.font = "900 32px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(dayName.toUpperCase(), 125, cardY + 50);

      // Courses Count Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      roundRect(ctx, 270, cardY + 22, 130, 36, 12);
      ctx.fill();
      ctx.fillStyle = dayCourses.length > 0 ? "#e2f7ea" : "#89a895";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${dayCourses.length} KELAS`, 335, cardY + 47);

      // Course Items List inside the Day Card
      if (dayCourses.length === 0) {
        ctx.fillStyle = "rgba(168, 213, 184, 0.45)";
        ctx.font = "italic 24px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Tidak ada jadwal kuliah (Hari bebas)", 125, cardY + 115);
      } else {
        const maxDisplay = 2;
        dayCourses.slice(0, maxDisplay).forEach((c, cIdx) => {
          const itemY = cardY + 95 + cIdx * 72;

          // Color accent pill
          ctx.fillStyle = c.warna_label || "#10b981";
          roundRect(ctx, 125, itemY - 24, 6, 44, 3);
          ctx.fill();

          // Course title
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "left";
          const title = c.nama_matkul.length > 26 ? c.nama_matkul.slice(0, 24) + "..." : c.nama_matkul;
          ctx.fillText(title, 145, itemY);

          // Time & Room
          ctx.fillStyle = "#a8d5b8";
          ctx.font = "bold 22px monospace";
          ctx.textAlign = "right";
          const timeRoom = `${c.jam_mulai.slice(0, 5)} - ${c.jam_selesai.slice(0, 5)}${c.ruangan ? ` · ${c.ruangan}` : ""}`;
          ctx.fillText(timeRoom, W - 125, itemY);
        });

        if (dayCourses.length > maxDisplay) {
          ctx.fillStyle = "#c8ef70";
          ctx.font = "bold 20px system-ui, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`+${dayCourses.length - maxDisplay} mata kuliah lainnya`, W - 125, cardY + dayCardH - 18);
        }
      }
    });

    // ── 5. Bottom Brand Watermark (y: 1840) ──
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Dibuat dengan ngampUS • Your Campus Command Center", W / 2, 1850);

    // Save download URL
    const url = canvas.toDataURL("image/png");
    setDownloadUrl(url);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `ngampus-jadwal-wallpaper-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#091e14] p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8ef70]/15 text-[#c8ef70] border border-[#c8ef70]/30">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-white">
                Wallpaper Lockscreen HP
              </h3>
              <p className="text-[11px] text-[#9dc5aa]">
                Pasang jadwal kuliah di lockscreen agar tidak salah ruang kelas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#789a84] hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wallpaper Preview Area */}
        <div className="my-4 flex-1 flex flex-col items-center justify-center overflow-hidden min-h-0">
          <div className="relative aspect-[9/16] h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-2 z-10">
                <Loader2 size={24} className="animate-spin text-[#c8ef70]" />
                <span className="text-xs font-bold text-[#b4d8c1]">Merender poster...</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="mt-2 text-[10px] text-[#789a84] font-mono">
            Rasio 9:16 (1080 × 1920 HD) • Cocok untuk Semua Layar Smartphone
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#b4d8c1] hover:bg-white/10 transition"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating || !downloadUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c8ef70] px-5 py-2.5 text-xs font-black text-[#103626] hover:bg-[#d8faa1] transition active:scale-95 shadow-md shadow-[#c8ef70]/20 cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>Download Gambar (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper canvas roundRect
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
