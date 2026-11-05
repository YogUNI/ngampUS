// Satu sumber data untuk landing page DAN video Remotion.
export const classes = [
  { time: "08:00–09:40", name: "Algoritma & Struktur Data", room: "Lab Komputer 3", lecturer: "Dr. Ir. Hendra Gunawan", sks: 3 },
  { time: "10:00–11:40", name: "Sistem Basis Data", room: "Gedung B Lt. 4, R. 402", lecturer: "Ibu Sari Dewi, M.Kom.", sks: 3 },
];
export const totalSks = classes.reduce((a, c) => a + c.sks, 0);
export const deadlines = [
  { title: "Baca Modul P5", tag: "Selesai", done: true, level: "done" },
  { title: "Tugas Basdat Bab 4", tag: "H-1", done: false, level: "urgent" },
  { title: "Kuis Algoritma", tag: "H-3", done: false, level: "normal" },
  { title: "Rapat Panitia Seminar", tag: "H-5", done: false, level: "normal" },
];
export const cv = {
  name: "Raka Pratama",
  meta: "Teknik Informatika · Semester 5",
  bullets: [
    "Project Officer, Tech Seminar 2025 · 450+ peserta",
    "Asisten Lab Basis Data · membimbing 40 mahasiswa",
    "Juara 2 Hackathon Kampus 2025",
  ],
  skills: ["Python", "React", "SQL"],
};
export const chaos = [
  { t: "Grup Kelas 3B", m: "999+ pesan belum dibaca", i: "G" },
  { t: "Tugas Basdat", m: "Dikumpul BESOK 23:59 !!", i: "T", urgent: true },
  { t: "Rapat BEM", m: "Bentrok sama kuliah Struktur Data", i: "B" },
  { t: "Modul P5", m: "Linknya di mana ya??", i: "M" },
  { t: "Kuis Dadakan", m: "Katanya jam 10.00 hari ini", i: "K" },
  { t: "Grup Kelas 3B", m: "Ada yang punya catatan P3?", i: "G" },
  { t: "Grup Organisasi", m: "Proker belum ada yang update", i: "O" },
];
