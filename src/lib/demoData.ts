/**
 * Sumber Kebenaran Tunggal Dataset Demo ngampUS
 * Digunakan secara konsisten di seluruh Landing Page dan Remotion HeroStory.
 */

export interface DemoCourse {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  room: string;
  time: string;
  sks: number;
  meetUrl?: string | null;
  status: "OFFLINE" | "ONLINE";
}

export interface DemoTask {
  id: string;
  title: string;
  course: string;
  deadline: string;
  timeRemaining: string;
  tag: string;
  progress: number;
  isUrgent: boolean;
}

export interface DemoProker {
  id: string;
  title: string;
  org: string;
  role: string;
  stage: string;
  progress: number;
  attendees: string;
  status: string;
}

export interface DemoResumeItem {
  id: string;
  category: "ORGANISASI" | "PROYEK AKADEMIK";
  title: string;
  role: string;
  period: string;
  bullet: string;
}

export const DEMO_DATA = {
  student: {
    name: "Yoga Gusti Rachmadi",
    campus: "Universitas Mercu Buana",
    major: "Teknik Informatika",
    semester: 4,
    statusText: "Semester 4 Aktif",
    ipk: "3.88",
  },
  
  // Total konsisten: 2 Mata Kuliah • 6 SKS
  totalCoursesToday: 2,
  totalSksToday: 6,
  
  courses: [
    {
      id: "matkul-1",
      code: "IF2104",
      name: "Algoritma & Struktur Data",
      lecturer: "Dr. Ir. Hendra Gunawan",
      room: "Lab Komputer 3",
      time: "08:00 - 09:40 WIB",
      sks: 3,
      meetUrl: "https://meet.google.com/abc-defg-hij",
      status: "OFFLINE" as const,
    },
    {
      id: "matkul-2",
      code: "IF2108",
      name: "Sistem Basis Data",
      lecturer: "Dr. Ir. Rushendra, MT",
      room: "Gedung B Lt. 4, R. 402",
      time: "10:00 - 11:40 WIB",
      sks: 3,
      meetUrl: null,
      status: "OFFLINE" as const,
    },
  ],

  urgentTask: {
    id: "task-1",
    title: "Laporan Praktikum Modul 4",
    course: "Algoritma & Struktur Data",
    deadline: "Besok 23:59 WIB",
    timeRemaining: "H-1",
    tag: "DEADLINE BESOK",
    progress: 85,
    isUrgent: true,
  },

  secondaryTask: {
    id: "task-2",
    title: "Makalah Kelompok Etika Profesi",
    course: "Etika Profesi & Hukum IT",
    deadline: "Jumat 23:59 WIB",
    timeRemaining: "H-4",
    tag: "TUGAS KELOMPOK",
    progress: 40,
    isUrgent: false,
  },

  proker: {
    id: "proker-1",
    title: "Webinar Nasional Cyber Security 2026",
    org: "BEM Fakultas Ilmu Komputer",
    role: "Project Officer",
    stage: "Fase Eksekusi",
    progress: 75,
    attendees: "450+ Peserta",
    status: "0 Bentrok Kuliah",
  },

  resume: [
    {
      id: "res-1",
      category: "ORGANISASI" as const,
      title: "Tech Seminar & Expo 2025",
      role: "Project Officer",
      period: "2024 - 2025",
      bullet: "Memimpin 20 panitia lintas divisi, mengelola anggaran Rp15 juta, dan berhasil memfasilitasi 450+ peserta seminar nasional.",
    },
    {
      id: "res-2",
      category: "PROYEK AKADEMIK" as const,
      title: "Aplikasi Rekap Kuliah Berbasis AI",
      role: "Lead Full-Stack Developer",
      period: "Semester 4",
      bullet: "Membangun web app terpadu dengan Next.js & Supabase, meraih nilai A (4.00), dan terpilih dalam pameran karya mahasiswa.",
    },
  ],
};

