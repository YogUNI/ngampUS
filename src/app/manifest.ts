import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ngampUS - Campus Command Center",
    short_name: "ngampUS",
    description: "Platform Manajemen Kuliah, Jadwal, Tugas, dan Organisasi Mahasiswa",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f6849",
    orientation: "portrait",
    categories: ["education", "productivity"],
    lang: "id",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo_ngampUS.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
