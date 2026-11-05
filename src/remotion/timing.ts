/**
 * Konfigurasi Timing Remotion 18 Detik (Golden Ratio 540 Frames @ 30 FPS)
 * Ditingkatkan dari source ngampus-hero-remotion-source agar alur animasi
 * memiliki pacing yang elegan, terbaca jelas, dan berdampak maksimal.
 */

export const FPS = 30;
export const TOTAL_FRAMES = 540; // 18 detik total
export const TOTAL = 540;

// Dimensi Komposisi
export const WIDTH_4_5 = 1080;
export const HEIGHT_4_5 = 1350; // Web Hero 4:5

export const WIDTH_9_16 = 1080;
export const HEIGHT_9_16 = 1920; // Mobile / TikTok 9:16

// Titik Awal & Durasi Tiap Adegan
export const A_START = 0;
export const A_LEN = 120; // 0s - 4.0s (120 frames) : Scene Chaos & WhatsApp overload

export const B_START = 120;
export const B_LEN = 60; // 4.0s - 6.0s (60 frames) : Scene Hard Cut "Cukup."

export const C_START = 180;
export const C_LEN = 210; // 6.0s - 13.0s (210 frames) : Scene Phone App UI & Interactive Checkbox

export const D_START = 390;
export const D_LEN = 150; // 13.0s - 18.0s (150 frames) : Scene Outcome CV ATS, Official Logo & CTA

// Spring Physics Presets
export const SPRING_SOFT = { damping: 18, stiffness: 100, mass: 0.9 };
export const SPRING_SNAP = { damping: 14, stiffness: 160, mass: 0.7 };
export const SPRING_DROP = { damping: 11, stiffness: 120, mass: 0.8 };
export const SPRING_SLAM = { damping: 12, stiffness: 220, mass: 0.6 };

export const TIMING = {
  FPS,
  TOTAL_FRAMES,
  TOTAL,
  WIDTH_4_5,
  HEIGHT_4_5,
  WIDTH_9_16,
  HEIGHT_9_16,
  A_START,
  A_LEN,
  B_START,
  B_LEN,
  C_START,
  C_LEN,
  D_START,
  D_LEN,
  SPRINGS: {
    soft: SPRING_SOFT,
    snap: SPRING_SNAP,
    drop: SPRING_DROP,
    slam: SPRING_SLAM,
  },
  COLORS: {
    bgDark: "#0a1f16",
    surfaceDark: "#12332a",
    surface2: "#1a4236",
    paper: "#F4F1EA",
    ink: "#0b140f",
    accentLime: "#C6F432",
    danger: "#FF4D3D",
    muted: "#6b7a72",
    line: "#E3DED3",
    chat: "#1b2924",
  },
};
