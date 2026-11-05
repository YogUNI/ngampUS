/**
 * Konstanta Timing & Animasi Remotion
 * Seluruh durasi, frame boundary, dan spring config dikelola terpusat di sini.
 */

export const TIMING = {
  FPS: 30,
  TOTAL_FRAMES: 360, // 12 Detik total
  WIDTH_4_5: 1080,
  HEIGHT_4_5: 1350,
  WIDTH_9_16: 1080,
  HEIGHT_9_16: 1920,

  // Scene Boundaries
  SCENE_CHAOS: {
    start: 0,
    duration: 90, // 0 - 3 dtk
  },
  SCENE_HARD_CUT: {
    start: 90,
    duration: 45, // 3 - 4.5 dtk
  },
  SCENE_ORGANIZED: {
    start: 135,
    duration: 135, // 4.5 - 9 dtk
  },
  SCENE_OUTCOME: {
    start: 270,
    duration: 90, // 9 - 12 dtk
  },

  // Color Tokens
  COLORS: {
    bgDark: "#0a1f16",
    surfaceDark: "#12332a",
    paper: "#F4F1EA",
    ink: "#0b140f",
    accentLime: "#C6F432",
    danger: "#FF4D3D",
    muted: "#8ca393",
    borderSubtle: "rgba(255, 255, 255, 0.12)",
    chatBgUser: "#1b4437",
    chatBgOther: "#143026",
  },

  // Physics Spring Configurations
  SPRINGS: {
    // Snappy entrance with slight overshoot
    snap: {
      damping: 14,
      mass: 0.8,
      stiffness: 120,
    },
    // Chaotic bouncy fall
    chaosBounce: {
      damping: 11,
      mass: 0.9,
      stiffness: 140,
    },
    // Smooth camera push
    camera: {
      damping: 20,
      mass: 1.2,
      stiffness: 90,
    },
    // Red pulse danger trigger
    pulse: {
      damping: 10,
      mass: 0.5,
      stiffness: 180,
    },
  },
};

