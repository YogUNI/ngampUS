import { CourseData } from "@/components/schedule/course-form-modal";

export function hariToJsDay(hari: number): number {
  return hari === 7 ? 0 : hari;
}

export interface CourseOccurrence {
  id: string;
  courseId: string;
  nama_matkul: string;
  kode_matkul?: string | null;
  sks: number;
  dosen_pengampu?: string | null;
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  tipe_pertemuan: string;
  ruangan?: string | null;
  link_pertemuan?: string | null;
  link_materi?: string | null;
  warna_label: string;
  date: Date;
  dateString: string;
}

export function generateCourseOccurrences(
  courses: (CourseData & { id: string })[],
  tanggalMulai?: string | null,
  tanggalSelesai?: string | null
): CourseOccurrence[] {
  if (!tanggalMulai || !tanggalSelesai || courses.length === 0) return [];

  const start = new Date(`${tanggalMulai}T00:00:00`);
  const end = new Date(`${tanggalSelesai}T23:59:59`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const occurrences: CourseOccurrence[] = [];

  for (const course of courses) {
    const targetJsDay = hariToJsDay(course.hari);
    const curr = new Date(start.getTime());

    const diff = (targetJsDay - curr.getDay() + 7) % 7;
    curr.setDate(curr.getDate() + diff);

    while (curr <= end) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, "0");
      const day = String(curr.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      occurrences.push({
        id: `${course.id}-${dateString}`,
        courseId: course.id,
        nama_matkul: course.nama_matkul,
        kode_matkul: course.kode_matkul,
        sks: course.sks,
        dosen_pengampu: course.dosen_pengampu,
        hari: course.hari,
        jam_mulai: course.jam_mulai,
        jam_selesai: course.jam_selesai,
        tipe_pertemuan: course.tipe_pertemuan,
        ruangan: course.ruangan,
        link_pertemuan: course.link_pertemuan,
        link_materi: course.link_materi,
        warna_label: course.warna_label || "#0f6849",
        date: new Date(curr.getTime()),
        dateString,
      });

      curr.setDate(curr.getDate() + 7);
    }
  }

  return occurrences.sort((a, b) => {
    const dateComp = a.dateString.localeCompare(b.dateString);
    if (dateComp !== 0) return dateComp;
    return a.jam_mulai.localeCompare(b.jam_mulai);
  });
}

export function generateIcsCalendar(
  courses: (CourseData & { id: string })[],
  tanggalMulai?: string | null,
  tanggalSelesai?: string | null,
  semesterName = "Semester"
): string {
  const occurrences = generateCourseOccurrences(courses, tanggalMulai, tanggalSelesai);
  if (occurrences.length === 0) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const events = occurrences.map((occ) => {
    const [startH, startM] = occ.jam_mulai.split(":");
    const [endH, endM] = occ.jam_selesai.split(":");
    const dateCompact = occ.dateString.replace(/-/g, "");

    const dtStart = `${dateCompact}T${pad(Number(startH))}${pad(Number(startM))}00`;
    const dtEnd = `${dateCompact}T${pad(Number(endH))}${pad(Number(endM))}00`;

    const descriptionParts = [
      `Mata Kuliah: ${occ.nama_matkul}`,
      occ.kode_matkul ? `Kode: ${occ.kode_matkul}` : null,
      `Beban: ${occ.sks} SKS`,
      occ.dosen_pengampu ? `Dosen: ${occ.dosen_pengampu}` : null,
      occ.tipe_pertemuan ? `Tipe: ${occ.tipe_pertemuan.toUpperCase()}` : null,
      occ.link_pertemuan ? `Link Virtual: ${occ.link_pertemuan}` : null,
      occ.link_materi ? `Link Materi: ${occ.link_materi}` : null,
    ].filter(Boolean);

    const description = descriptionParts.join("\\n");
    const location = occ.ruangan || (occ.tipe_pertemuan === "online" ? "Online / Virtual Class" : "");

    return [
      "BEGIN:VEVENT",
      `UID:${occ.id}@ngampus.app`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=Asia/Jakarta:${dtStart}`,
      `DTEND;TZID=Asia/Jakarta:${dtEnd}`,
      `SUMMARY:${occ.nama_matkul} (${occ.sks} SKS)`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${location}` : null,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ngampUS//Jadwal Kuliah Mahasiswa//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Jadwal Kuliah - ${semesterName}`,
    "X-WR-TIMEZONE:Asia/Jakarta",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
