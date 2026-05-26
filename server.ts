import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route first
app.post("/api/generate-curriculum", async (req, res) => {
  const {
    identitas,
    jenjang,
    kelas,
    fase,
    mapel,
    jpPerMinggu = 3,
    mingguEfektif = 18,
    tpPerBab = 3,
    jpPenilaian = 2,
    babs = []
  } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("No valid GEMINI_API_KEY found, using local intelligent simulation generator.");
    // Generate beautiful and accurate curriculum offline fallback
    const result = generateOfflineCurriculum(req.body);
    return res.json({ success: true, isDemo: true, ...result });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const babsSummary = babs.map((b: any, index: number) => {
      return `Bab ${index + 1}: "${b.nama}" (Semester: ${b.semester}, Alokasi JP dalam setahun: ${b.jp || 4} JP)`;
    }).join("\n");

    const prompt = `
      Anda adalah seorang Ahli Kurikulum Pendidikan Indonesia yang berspesialisasi dalam Kurikulum Merdeka (Kepka BSKAP No. 032/H/KR/2024).
      Tolong buatkan dokumen administrasi pembelajaran Kurikulum Merdeka secara lengkap dan terstruktur.

      IDENTITAS:
      - Nama Sekolah: ${identitas.namaSekolah || "SMP"}
      - Nama Guru: ${identitas.namaGuru || "Pendidik"}
      - Jenjang: ${jenjang}
      - Kelas: ${kelas}
      - Fase: ${fase}
      - Mata Pelajaran: ${mapel}
      - JP Per Minggu: ${jpPerMinggu} JP
      - Minggu Efektif: ${mingguEfektif} minggu per semester
      - Rencana TP per bab: ${tpPerBab} TP
      - JP Penilaian Sumatif per bab: ${jpPenilaian} JP

      DAFTAR BAB/MATERI:
      ${babsSummary}

      TUGAS ANDA:
      1. Tuliskan Capaian Pembelajaran (CP) Kurikulum Merdeka resmi yang sesuai dengan Fase ${fase} dan Mata Pelajaran ${mapel}. Jika mata pelajaran adalah kustom, generasikan CP teoretis yang sangat relevan dan profesional.
      2. Buatlah Tujuan Pembelajaran (TP) untuk setiap Bab yang diberikan. Setiap Bab harus memiliki tepat ${tpPerBab} TP. TP harus dirumuskan secara operasional menggunakan formula ABCD (Audience, Behavior, Condition, Degree) dan kriteria SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Berikan kode unik, seperti "TP ${kelas === 'Kelas 7' ? '7' : kelas.replace(/\D/g, '')}.1.1" untuk Bab 1 TP 1, "TP ${kelas === 'Kelas 7' ? '7' : kelas.replace(/\D/g, '')}.1.2" untuk Bab 1 TP 2, dst.
      3. Urutkan seluruh TP tersebut menjadi Alur Tujuan Pembelajaran (ATP). Berikan kode ATP (misal "ATP.${fase.replace(/\s/g, '')}.${kelas === 'Kelas 7' ? '7' : kelas.replace(/\D/g, '')}.1.1"), hubungkan dengan TP yang bersangkutan, tuliskan alokasi JP per TP secara rinci, dan berikan Justifikasi Logis mengapa TP tersebut ditempatkan pada urutan tersebut (misal: "Dimulai dari konsep konkret sebelum mengarah ke abstrak").
      4. Buatlah Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) menggunakan metode Rubrik untuk setidaknya 1 TP kunci pilihan per Bab. Berikan rubrik penilaian 4 level untuk aspek esensial: Baru Berkembang (0-60), Layak (61-70), Cakap (71-85), dan Mahir (86-100).
      5. Distribusikan JP ke dalam Minggu Efektif (Promes per minggu). Jumlah minggu efektif per semester adalah ${mingguEfektif} minggu. Total JP Semester 1 = ${jpPerMinggu} JP * ${mingguEfektif} minggu = ${jpPerMinggu * mingguEfektif} JP. Distribusikan alokasi JP per Bab secara logis dan berurutan dari minggu ke minggu (misal Bab 1 diajarkan di minggu 1-4, Bab 2 minggu 5-8, dst). Hasilnya harus berupa array alokasi JP mingguan sebanyak tepat 18 angka untuk setiap Bab. Total JP yang dialokasikan di promes harus sesuai dengan JP Bab tersebut.

      Berikan keluaran dalam format JSON murni yang sesuai dengan responseSchema berikut. Pastikan data mengalir secara logis dan rapi.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cpText: {
              type: Type.STRING,
              description: "Teks lengkap Capaian Pembelajaran (CP) resmi atau teoretis berbobot tinggi untuk mata pelajaran ini."
            },
            tps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  babName: { type: Type.STRING },
                  semester: { type: Type.STRING },
                  tujuanPembelajaran: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                      description: "Contoh: 'TP 7.1.1: Peserta didik mampu mengidentifikasi nilai Pancasila melalui diskusi kelompok secara tepat'"
                    }
                  }
                },
                required: ["babName", "tujuanPembelajaran"]
              }
            },
            atps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING, description: "Misal: ATP.D.7.1.1" },
                  tpCode: { type: Type.STRING, description: "Misal: TP 7.1.1" },
                  tpText: { type: Type.STRING, description: "Rumusan TP lengkap" },
                  alokasiJP: { type: Type.INTEGER },
                  justifikasi: { type: Type.STRING }
                },
                required: ["code", "tpCode", "tpText", "alokasiJP", "justifikasi"]
              }
            },
            kktp: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  babName: { type: Type.STRING },
                  tpCode: { type: Type.STRING },
                  tpText: { type: Type.STRING },
                  rubrik: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        aspek: { type: Type.STRING },
                        baruBerkembang: { type: Type.STRING },
                        layak: { type: Type.STRING },
                        cakap: { type: Type.STRING },
                        mahir: { type: Type.STRING }
                      },
                      required: ["aspek", "baruBerkembang", "layak", "cakap", "mahir"]
                    }
                  }
                },
                required: ["babName", "tpCode", "tpText", "rubrik"]
              }
            },
            weeksDistribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  babName: { type: Type.STRING },
                  semester: { type: Type.STRING },
                  weeks: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "Array berisi persis 18 angka (mewakili 18 minggu efektif) yang menampilkan pembagian jam pelajaran (JP) per bab minggu demi minggu."
                  }
                },
                required: ["babName", "semester", "weeks"]
              }
            }
          },
          required: ["cpText", "tps", "atps", "kktp", "weeksDistribution"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({ success: true, isDemo: false, ...parsedData });

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Fallback on error
    const result = generateOfflineCurriculum(req.body);
    return res.json({
      success: true,
      isDemo: true,
      errorMsg: error.message || "Gagal menghubungi AI, menggunakan generator lokal berkualitas tinggi.",
      ...result
    });
  }
});

// Offline curriculum generator simulator helper
function generateOfflineCurriculum(data: any) {
  const {
    identitas = {},
    jenjang = "SMP / MTs",
    kelas = "Kelas 7",
    fase = "Fase D",
    mapel = "Pendidikan Agama Islam & BP",
    jpPerMinggu = 3,
    mingguEfektif = 18,
    tpPerBab = 3,
    jpPenilaian = 2,
    babs = []
  } = data;

  const kelasNum = kelas.replace(/\D/g, "") || "7";

  // 1. Generate CP
  const cpText = `Pada akhir ${fase}, peserta didik memiliki kemampuan awal yang memadai untuk memahami dan mengevaluasi materi esensial pada mata pelajaran ${mapel}. Peserta didik juga dapat mengomunikasikan gagasan, memecahkan masalah kontekstual, serta menerapkan nilai luhur Pancasila dalam kehidupan sehari-hari berdasarkan konsep dasar yang diajarkan pada jenjang ${jenjang}, khususnya di ${kelas}. Secara spesifik, dalam bahasan bab yang dipelajari, peserta didik menguasai analisis terhadap fenomena lingkungan dan konsep keilmuan yang dipelajari secara kritis, logis, kreatif, dan mandiri sesuai dengan tuntutan Kepka BSKAP No. 032/H/KR/2024 Kurikulum Merdeka.`;

  // 2. Generate TPs
  const tps: any[] = [];
  const atps: any[] = [];
  const kktp: any[] = [];

  let overallTpCounter = 1;

  babs.forEach((bab: any, babIdx: number) => {
    const babName = bab.nama || `Materi Bab ${babIdx + 1}`;
    const sem = bab.semester || "1";
    const totalBabJP = Number(bab.jp) || 12;

    const babTps: string[] = [];
    const jpShare = Math.floor(totalBabJP / tpPerBab) || 4;

    for (let i = 1; i <= tpPerBab; i++) {
      const tpCode = `TP ${kelasNum}.${babIdx + 1}.${i}`;
      const atpCode = `ATP.${fase.replace(/\s/g, "")}.${kelasNum}.${babIdx + 1}.${i}`;
      
      let behavior = "";
      let aspectName = "";
      if (i === 1) {
        behavior = `menjelaskan konsep dasar dan latar belakang sejarah dari ${babName} secara kritis`;
        aspectName = "Pemahaman Konsep";
      } else if (i === 2) {
        behavior = `menganalisis implementasi praktis dan studi kasus terkait ${babName} dalam kelompok kecil`;
        aspectName = "Analisis & Implementasi";
      } else {
        behavior = `merancang solusi kreatif terhadap persoalan nyata dalam lingkup ${babName} dengan percaya diri`;
        aspectName = "Kreativitas & Evaluasi";
      }

      const tpText = `${tpCode}: Peserta didik mampu ${behavior} setelah mempelajari topik ini secara mendalam sesuai petunjuk guru.`;
      babTps.push(tpText);

      // ATP list
      atps.push({
        code: atpCode,
        tpCode: tpCode,
        tpText: tpText,
        alokasiJP: jpShare,
        justifikasi: i === 1 
          ? "Pengenalan definisi dasar dan teoritis agar peserta didik memiliki pondasi kognitif yang kuat."
          : i === 2
          ? "Pembahasan diperluas ke ranah analisis konseptual dan studi kasus demi mengasah daya nalar kritis."
          : "Pemberian tugas kolaboratif dan proyek kreatif sebagai puncak pembelajaran berbasis pengalaman nyata."
      });

      // KKTP rubrik (pilih TP 1 per bab untuk rubrik detail)
      if (i === 1) {
        kktp.push({
          babName: babName,
          tpCode: tpCode,
          tpText: tpText,
          rubrik: [
            {
              aspek: aspectName,
              baruBerkembang: "Belum mampu menjabarkan definisi dasar ataupun istilah kunci, serta memerlukan bimbingan penuh dari guru.",
              layak: "Mampu menjelaskan definisi dasar dan sebagian kecil materi utama tetapi penjelasannya kurang lengkap atau terstruktur.",
              cakap: "Mampu menguraikan konsep utama dengan istilah yang tepat, sistematis, mandiri, dan berkolaborasi aktif dengan kelompok.",
              mahir: "Mampu menganalisis kaitan konseptual secara mendalam, memberikan contoh konkret aplikatif, serta membimbing teman sejawat."
            },
            {
              aspek: "Kemandirian Kerja",
              baruBerkembang: "Tugas diselesaikan melampaui tenggat waktu dengan asistensi instruktur yang konstan.",
              layak: "Menyelesaikan tugas secara mandiri namun sering kali membutuhkan petunjuk dan arahan tambahan demi ketepatan.",
              cakap: "Menunjukkan tanggung jawab, berinisiatif memecahkan rintangan kecil, dan menyelesaikan materi tepat waktu secara prima.",
              mahir: "Sangat gigih dan berinisiatif tinggi mencari sumber referensi baru, menyelesaikan tugas sebelum tenggat waktu dengan kualitas tinggi."
            }
          ]
        });
      }
    }

    tps.push({
      babName,
      semester: sem,
      tujuanPembelajaran: babTps
    });
  });

  // 3. Generate Promes per minggu (array isi 18 untuk tiap bab)
  // Distribusikan bab secara berurutan sepanjang minggu 1-18 berdasarkan semester
  const weeksDistribution: any[] = [];
  
  // Pisahkan bab berdasarkan semester
  const sem1Babs = babs.filter((b: any) => b.semester === "1");
  const sem2Babs = babs.filter((b: any) => b.semester === "2");

  const distributeSemesterBabs = (semesterBabs: any[], semStr: string) => {
    let currentWeekOffset = 1;
    const totalWeeks = 18;

    semesterBabs.forEach((bab: any, idx: number) => {
      const babJP = Number(bab.jp) || 12;
      const babName = bab.nama || `Materi Bab`;
      
      // Hitung berapa minggu bab ini berjalan
      const weeksNeeded = Math.ceil(babJP / jpPerMinggu) || 3;
      const weeksArr = Array(totalWeeks).fill(0);

      let allocated = 0;
      for (let w = 0; w < weeksNeeded; w++) {
        const weekIndex = (currentWeekOffset - 1) + w;
        if (weekIndex < totalWeeks) {
          const jpToAssign = Math.min(jpPerMinggu, babJP - allocated);
          weeksArr[weekIndex] = jpToAssign;
          allocated += jpToAssign;
        }
      }

      currentWeekOffset += weeksNeeded;
      // Jangan sampai offset melebihi 18
      if (currentWeekOffset > totalWeeks) {
        currentWeekOffset = totalWeeks;
      }

      weeksDistribution.push({
        babName,
        semester: semStr,
        weeks: weeksArr
      });
    });
  };

  distributeSemesterBabs(sem1Babs, "1");
  distributeSemesterBabs(sem2Babs, "2");

  return { cpText, tps, atps, kktp, weeksDistribution };
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
