export interface IdentitasPembelajaran {
  namaSekolah: string;
  namaGuru: string;
  nuptk: string;
  tahunPelajaran: string;
  semester: "Ganjil" | "Genap" | "Ganjil & Genap";
  kurikulum: string;
  alamatSekolah: string;
}

export interface BabMateri {
  id: string;
  nama: string;
  semester: "1" | "2";
  jp: number;
}

export interface TPItem {
  babName: string;
  semester: string;
  tujuanPembelajaran: string[];
}

export interface ATPItem {
  code: string;
  tpCode: string;
  tpText: string;
  alokasiJP: number;
  justifikasi: string;
}

export interface KKTPRubrikRow {
  aspek: string;
  baruBerkembang: string;
  layak: string;
  cakap: string;
  mahir: string;
}

export interface KKTPItem {
  babName: string;
  tpCode: string;
  tpText: string;
  rubrik: KKTPRubrikRow[];
}

export interface WeeksDistribution {
  babName: string;
  semester: string;
  weeks: number[]; // exactly 18 weeks representation
}

export interface CurriculumResult {
  cpText: string;
  tps: TPItem[];
  atps: ATPItem[];
  kktp: KKTPItem[];
  weeksDistribution: WeeksDistribution[];
}

export interface SavedProject {
  id: string;
  title: string;
  savedAt: string;
  identitas: IdentitasPembelajaran;
  jenjang: string;
  kelas: string;
  fase: string;
  mapel: string;
  customMapel: string;
  jpPerMinggu: number;
  mingguEfektif: number;
  tpPerBab: number;
  jpPenilaian: number;
  babs: BabMateri[];
  result?: CurriculumResult | null;
}
