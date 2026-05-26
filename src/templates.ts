import { BabMateri } from "./types";

export interface SubjectTemplate {
  name: string;
  jenjang: string;
  kelas: string;
  fase: string;
  mapel: string;
  jpPerMinggu: number;
  mingguEfektif: number;
  tpPerBab: number;
  jpPenilaian: number;
  babs: { nama: string; semester: "1" | "2"; jp: number }[];
}

export const TEMPLATES: Record<string, SubjectTemplate> = {
  pai_smp_7: {
    name: "Al-Qur'an&Hadis, Aqidah, Akhlak, Fiqih, Sejarah (SMP Kls 7)",
    jenjang: "SMP / MTs",
    kelas: "Kelas 7",
    fase: "Fase D",
    mapel: "Pendidikan Agama Islam & BP",
    jpPerMinggu: 3,
    mingguEfektif: 18,
    tpPerBab: 3,
    jpPenilaian: 2,
    babs: [
      { nama: "Al-Qur'an dan Hadis: Meneladani Ketaatan dan Kebenaran", semester: "1", jp: 12 },
      { nama: "Aqidah: Meneladani Sifat-Sifat Wajib dan Mustahil Allah SWT", semester: "1", jp: 12 },
      { nama: "Akhlak: Budaya Salam, Senyum, Sapa dan Indahnya Sopan Santun", semester: "1", jp: 15 },
      { nama: "Fiqih: Bersuci (Thaharah) dari Hadats dan Najis", semester: "1", jp: 15 },
      { nama: "Fiqih: Tata Cara Shalat Berjamaah dan Shalat Jum'at", semester: "2", jp: 12 },
      { nama: "Akhlak: Menjauhi Sifat Riya, Ghibah, dan Kebiasaan Merundung", semester: "2", jp: 12 },
      { nama: "Sejarah: Sejarah Dakwah Nabi Muhammad SAW Periode Makkah", semester: "2", jp: 15 },
      { nama: "Al-Qur'an dan Hadis: Membaca dan Memahami Surah Pendek Pilihan", semester: "2", jp: 15 }
    ]
  },
  pancasila_smp_7: {
    name: "Sejarah Pancasila, Norma, Keberagaman & NKRI (SMP Kls 7)",
    jenjang: "SMP / MTs",
    kelas: "Kelas 7",
    fase: "Fase D",
    mapel: "Pancasila (PPKn)",
    jpPerMinggu: 3,
    mingguEfektif: 18,
    tpPerBab: 3,
    jpPenilaian: 2,
    babs: [
      { nama: "Sejarah Kelahiran Pancasila dan Perumusan Dasar Negara", semester: "1", jp: 12 },
      { nama: "Penerapan Nilai-Nilai Pancasila dalam Kehidupan Bermasyarakat", semester: "1", jp: 12 },
      { nama: "Norma-Norma Sosial, Hukum, Agama, dan Rasa Keadilan", semester: "1", jp: 15 },
      { nama: "UUD Negara Republik Indonesia Tahun 1945 Sebagai Konstitusi", semester: "1", jp: 15 },
      { nama: "Keberagaman Suku, Agama, Ras dan Antargolongan dalam NKRI", semester: "2", jp: 15 },
      { nama: "Kerja Sama dan Gotong Royong dalam Kehidupan Bermasyarakat", semester: "2", jp: 12 },
      { nama: "Karakteristik Daerah dalam Bingkai Negara Kesatuan RI", semester: "2", jp: 12 },
      { nama: "Menjaga Keutuhan NKRI Melalui Peran Aktif Siswa SMP", semester: "2", jp: 15 }
    ]
  },
  indo_smp_7: {
    name: "Teks Deskripsi, Cerita Fantasi, Prosedur, Buku (SMP Kls 7)",
    jenjang: "SMP / MTs",
    kelas: "Kelas 7",
    fase: "Fase D",
    mapel: "Bahasa Indonesia",
    jpPerMinggu: 4,
    mingguEfektif: 18,
    tpPerBab: 3,
    jpPenilaian: 2,
    babs: [
      { nama: "Jelajah Nusantara: Menulis Cerita Teks Deskripsi Objek Wisata", semester: "1", jp: 16 },
      { nama: "Berkelana di Dunia Imajinasi: Membaca dan Menulis Cerita Fantasi", semester: "1", jp: 16 },
      { nama: "Hal Baik Bagi Tubuh: Langkah Menulis Teks Prosedur Kegiatan", semester: "1", jp: 20 },
      { nama: "Aksi Nyata Pelindung Bumi: Membaca Berita dan Menemukan Fakta", semester: "1", jp: 20 },
      { nama: "Membuka Gerbang Dunia: Menganalisis Buku Fiksi dan Non-Fiksi", semester: "2", jp: 18 },
      { nama: "Sampaikan Melalui Surat: Menulis Surat Pribadi dan Surat Dinas", semester: "2", jp: 18 },
      { nama: "Berkreasi dengan Puisi Rakyat: Pantun, Syair, dan Gurindam", semester: "2", jp: 18 },
      { nama: "Menjadi Pembicara Handal: Melakukan Presentasi dan Debat Terbuka", semester: "2", jp: 18 }
    ]
  },
  paud_fondasi: {
    name: "Aku Istimewa, Lingkunganku, Bermain & Kerja Sama (PAUD)",
    jenjang: "PAUD / TK",
    kelas: "Kelas A (4-5 Tahun)",
    fase: "Fase Fondasi",
    mapel: "Pengembangan Karakter & Motorik",
    jpPerMinggu: 5,
    mingguEfektif: 18,
    tpPerBab: 2,
    jpPenilaian: 0,
    babs: [
      { nama: "Aku Istimewa: Mengenal Identitas Diri, Anggota Tubuh, dan Emosi", semester: "1", jp: 15 },
      { nama: "Lingkunganku yang Indah: Mengenal Keluarga, Rumah, dan Sekolah", semester: "1", jp: 15 },
      { nama: "Hewan Sahabatku: Mengenal Berbagai Jenis Hewan di Sekitar Kita", semester: "1", jp: 15 },
      { nama: "Bermain dan Bekerjasama: Melatih Motorik Kasar & Kognisi Dasar", semester: "2", jp: 15 },
      { nama: "Tanaman Ciptaan Tuhan: Menanam, Menyiram, dan Menyayangi Flora", semester: "2", jp: 15 },
      { nama: "Indahnya Berbagi: Menumbuhkan Sikap Empati dan Kebiasaan Antre", semester: "2", jp: 15 }
    ]
  },
  smk_rpl_10: {
    name: "K3LH, Logika Kejuruan, Dasar Web, Database (SMK Kls 10)",
    jenjang: "SMK / MAK",
    kelas: "Kelas 10",
    fase: "Fase E",
    mapel: "Dasar-Dasar Program Keahlian",
    jpPerMinggu: 6,
    mingguEfektif: 18,
    tpPerBab: 4,
    jpPenilaian: 2,
    babs: [
      { nama: "Proses Bisnis dan Budaya Kerja Industri Perangkat Lunak (K3LH)", semester: "1", jp: 24 },
      { nama: "Perkembangan Teknologi dan Isu-Isu Global Bidang Software RPL", semester: "1", jp: 24 },
      { nama: "Profesi, Kewirausahaan (Technopreneurship), dan Job Profile", semester: "1", jp: 30 },
      { nama: "Orientasi Dasar Pemrograman Berorientasi Objek dan Algoritma", semester: "1", jp: 30 },
      { nama: "Implementasi Dasar HTML, CSS, dan Javascript untuk Web Statis", semester: "2", jp: 36 },
      { nama: "Konsep Dasar Sistem Database, Tabel, Relasi, dan SQL Query", semester: "2", jp: 36 },
      { nama: "Pemrograman Terstruktur Menggunakan Struktur Kontrol & Array", semester: "2", jp: 36 }
    ]
  }
};
