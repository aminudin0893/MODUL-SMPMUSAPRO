import { SavedProject, CurriculumResult } from "./types";

/**
 * Generates an MS Word-compatible HTML file (.doc format) with styles, headers, and formatted tables.
 * This utilizes MS Word's native capability to parse HTML/CSS perfectly.
 */
export function exportToWord(project: SavedProject, results: CurriculumResult, type: "full" | "prota" | "promes" | "kktp" | "atp" | "cp_tp") {
  const { identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif } = project;
  const currentMapel = mapel === "Custom" ? customMapel : mapel;

  let title = `Perangkat_Kurikulum_Merdeka_${currentMapel.replace(/\s+/g, "_")}`;
  let contentHtml = "";

  const headerTable = `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-family: 'Arial', sans-serif; font-size: 11pt;">
      <tr>
        <td style="width: 30%; font-weight: bold; padding: 4px 0;">Nama Sekolah</td>
        <td style="width: 5%; padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${identitas.namaSekolah}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 4px 0;">Nama Guru</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${identitas.namaGuru}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 4px 0;">NIP / NUPTK</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${identitas.nuptk || "-"}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 4px 0;">Mata Pelajaran</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; font-weight: bold;">${currentMapel}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 4px 0;">Jenjang / Kelas / Fase</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${jenjang} / ${kelas} / ${fase}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 4px 0;">Tahun Pelajaran</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${identitas.tahunPelajaran}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 4px 0;">Alokasi Waktu</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${jpPerMinggu} JP x ${mingguEfektif} Minggu Efektif</td>
      </tr>
    </table>
  `;

  if (type === "full" || type === "cp_tp") {
    contentHtml += `
      <div style="page-break-after: always;">
        <h2 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 14pt; margin-bottom: 2px; text-transform: uppercase;">
          CAPAIAN PEMBELAJARAN (CP) & TUJUAN PEMBELAJARAN (TP)
        </h2>
        <h3 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 12pt; margin-top: 0; margin-bottom: 20px; font-weight: normal;">
          KURIKULUM MERDEKA - TAHUN PELAJARAN ${identitas.tahunPelajaran}
        </h3>
        ${headerTable}

        <h4 style="font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 8px; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 3px;">
          I. CAPAIAN PEMBELAJARAN (Kepka BSKAP No. 032/H/KR/2024)
        </h4>
        <div style="font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 24px; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
          ${results.cpText}
        </div>

        <h4 style="font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 8px; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 3px;">
          II. TUJUAN PEMBELAJARAN (TP) PER BAB
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Arial', sans-serif; font-size: 10pt; margin-bottom: 24px;" border="1" cellpadding="6">
          <thead>
            <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
              <th style="width: 5%; border: 1px solid #cbd5e1;">No</th>
              <th style="width: 25%; border: 1px solid #cbd5e1;">Bab / Materi Pokok</th>
              <th style="width: 10%; border: 1px solid #cbd5e1;">Semester</th>
              <th style="border: 1px solid #cbd5e1;">Rumusan Tujuan Pembelajaran (ABCD & SMART)</th>
            </tr>
          </thead>
          <tbody>
            ${results.tps.map((tp, idx) => `
              <tr>
                <td style="text-align: center; border: 1px solid #cbd5e1; vertical-align: top;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; font-weight: bold; vertical-align: top;">${tp.babName}</td>
                <td style="text-align: center; border: 1px solid #cbd5e1; vertical-align: top;">Smtr ${tp.semester}</td>
                <td style="border: 1px solid #cbd5e1; vertical-align: top;">
                  <ul style="margin: 0; padding-left: 20px;">
                    ${tp.tujuanPembelajaran.map(stmt => `<li style="margin-bottom: 4px;">${stmt}</li>`).join("")}
                  </ul>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  if (type === "full" || type === "atp") {
    contentHtml += `
      <div style="page-break-after: always; ${type === 'full' ? 'margin-top: 30px;' : ''}">
        <h2 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 14pt; margin-bottom: 2px; text-transform: uppercase;">
          ALUR TUJUAN PEMBELAJARAN (ATP)
        </h2>
        <h3 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 12pt; margin-top: 0; margin-bottom: 20px; font-weight: normal;">
          KURIKULUM MERDEKA - TAHUN PELAJARAN ${identitas.tahunPelajaran}
        </h3>
        ${headerTable}

        <h4 style="font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 8px; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 3px;">
          URUTAN ALUR TUJUAN PEMBELAJARAN (ATP) & JUSTIFIKASI LOGIS
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Arial', sans-serif; font-size: 9.5pt; margin-bottom: 24px;" border="1" cellpadding="6">
          <thead>
            <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
              <th style="width: 10%; border: 1px solid #cbd5e1;">Kode ATP</th>
              <th style="width: 10%; border: 1px solid #cbd5e1;">Kode TP</th>
              <th style="width: 45%; border: 1px solid #cbd5e1;">Rumusan Pembelajaran Tujuan (TP)</th>
              <th style="width: 8%; border: 1px solid #cbd5e1;">Alokasi JP</th>
              <th style="border: 1px solid #cbd5e1;">Justifikasi Alur Penyusunan</th>
            </tr>
          </thead>
          <tbody>
            ${results.atps.map(atp => `
              <tr>
                <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold; color: #0284c7;">${atp.code}</td>
                <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold;">${atp.tpCode}</td>
                <td style="border: 1px solid #cbd5e1;">${atp.tpText}</td>
                <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold;">${atp.alokasiJP} JP</td>
                <td style="border: 1px solid #cbd5e1; color: #475569; font-style: italic;">${atp.justifikasi}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  if (type === "full" || type === "prota") {
    // Collect Semester Breakdown
    const s1Babs = project.babs.filter(b => b.semester === "1");
    const s2Babs = project.babs.filter(b => b.semester === "2");
    
    contentHtml += `
      <div style="page-break-after: always; ${type === 'full' ? 'margin-top: 30px;' : ''}">
        <h2 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 14pt; margin-bottom: 2px; text-transform: uppercase;">
          PROGRAM TAHUNAN (PROTA)
        </h2>
        <h3 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 12pt; margin-top: 0; margin-bottom: 20px; font-weight: normal;">
          KURIKULUM MERDEKA - TAHUN PELAJARAN ${identitas.tahunPelajaran}
        </h3>
        ${headerTable}

        <table style="width: 100%; border-collapse: collapse; font-family: 'Arial', sans-serif; font-size: 10pt; margin-bottom: 24px;" border="1" cellpadding="6">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: center;">
              <th style="width: 10%; border: 1px solid #334155;">Semester</th>
              <th style="width: 8%; border: 1px solid #334155;">Bab</th>
              <th style="border: 1px solid #334155;">Mata Pelajaran / Materi Pokok</th>
              <th style="width: 15%; border: 1px solid #334155;">Alokasi JP</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td style="text-align: center; border: 1px solid #cbd5e1;" rowspan="${s1Babs.length + 1}">Ganjil (1)</td>
              <td style="border: 1px solid #cbd5e1;" colspan="3">Semester Ganjil - Ketuntasan Belajar Terencana</td>
            </tr>
            ${s1Babs.map((b, bIdx) => `
              <tr>
                <td style="text-align: center; border: 1px solid #cbd5e1;">Bab ${bIdx + 1}</td>
                <td style="border: 1px solid #cbd5e1;">${b.nama}</td>
                <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold;">${b.jp} JP</td>
              </tr>
            `).join("")}

            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td style="text-align: center; border: 1px solid #cbd5e1;" rowspan="${s2Babs.length + 1}">Genap (2)</td>
              <td style="border: 1px solid #cbd5e1;" colspan="3">Semester Genap - Ketuntasan Belajar Terencana</td>
            </tr>
            ${s2Babs.map((b, bIdx) => `
              <tr>
                <td style="text-align: center; border: 1px solid #cbd5e1;">Bab ${bIdx + 1 + s1Babs.length}</td>
                <td style="border: 1px solid #cbd5e1;">${b.nama}</td>
                <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold;">${b.jp} JP</td>
              </tr>
            `).join("")}
            <tr style="background-color: #f1f5f9; font-weight: bold;">
              <td style="border: 1px solid #cbd5e1; text-align: right;" colspan="3">Total Alokasi Pembelajaran Setahun:</td>
              <td style="border: 1px solid #cbd5e1; text-align: center; font-size: 11pt; color: #0284c7;">
                ${project.babs.reduce((acc, b) => acc + Number(b.jp), 0)} JP
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  if (type === "full" || type === "promes") {
    // Split for Promes S1 and S2
    const semestersToGen = ["1", "2"];

    semestersToGen.forEach((semStr) => {
      const babsInSem = results.weeksDistribution.filter(w => w.semester === semStr);
      if (babsInSem.length === 0) return;

      contentHtml += `
        <div style="page-break-after: always; ${type === 'full' ? 'margin-top: 30px;' : ''}">
          <h2 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 13pt; margin-bottom: 2px; text-transform: uppercase;">
            PROGRAM SEMESTER (PROMES) - SEMESTER ${semStr === "1" ? "GANJIL (1)" : "GENAP (2)"}
          </h2>
          <h3 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 11pt; margin-top: 0; margin-bottom: 15px; font-weight: normal;">
            KURIKULUM MERDEKA - TAHUN PELAJARAN ${identitas.tahunPelajaran}
          </h3>
          ${headerTable}

          <table style="width: 100%; border-collapse: collapse; font-family: 'Arial', sans-serif; font-size: 8.5pt;" border="1" cellpadding="3">
            <thead>
              <tr style="background-color: #0f172a; color: white; text-align: center; font-weight: bold;">
                <th style="border: 1px solid #334155;" rowspan="2">No</th>
                <th style="border: 1px solid #334155; width: 35%;" rowspan="2">Materi Pokok / Agenda Bab</th>
                <th style="border: 1px solid #334155; width: 8%;" rowspan="2">Jml JP</th>
                <th style="border: 1px solid #334155;" colspan="18">Distribusi Jam Pelajaran (JP) per Minggu Efektif</th>
              </tr>
              <tr style="background-color: #1e293b; color: white; text-align: center; font-weight: bold; font-size: 7.5pt;">
                ${Array.from({ length: 18 }, (_, k) => `<th style="border: 1px solid #475569; width: 2.8%;">${k + 1}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${babsInSem.map((dist, idx) => {
                const associatedBab = project.babs.find(b => b.nama === dist.babName);
                const currentJP = associatedBab ? associatedBab.jp : 12;
                return `
                  <tr>
                    <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold;">${idx + 1}</td>
                    <td style="border: 1px solid #cbd5e1; font-weight: 500;">${dist.babName}</td>
                    <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold; background-color: #f8fafc;">${currentJP} JP</td>
                    ${dist.weeks.map(val => {
                      const bg = val > 0 ? "background-color: #e0f2fe; color: #0369a1; font-weight: bold;" : "";
                      return `<td style="text-align: center; border: 1px solid #cbd5e1; ${bg}">${val || "-"}</td>`;
                    }).join("")}
                  </tr>
                `;
              }).join("")}
              <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
                <td style="border: 1px solid #cbd5e1;" colspan="2">Jumlah Distribusi JP Mingguan:</td>
                <td style="border: 1px solid #cbd5e1; background-color: #e2e8f0;">
                  ${babsInSem.reduce((accum, dist) => {
                    const matched = project.babs.find(b => b.nama === dist.babName);
                    return accum + (matched ? Number(matched.jp) : 12);
                  }, 0)} JP
                </td>
                ${Array.from({ length: 18 }, (_, wIdx) => {
                  const weekSum = babsInSem.reduce((acc, dist) => acc + (dist.weeks[wIdx] || 0), 0);
                  const isExceeded = weekSum > jpPerMinggu;
                  const bg = isExceeded ? "background-color: #fef2f2; color: #991b1b;" : "background-color: #e2e8f0;";
                  return `<td style="border: 1px solid #cbd5e1; ${bg}">${weekSum || "-"}</td>`;
                }).join("")}
              </tr>
            </tbody>
          </table>
          <p style="font-family: 'Arial', sans-serif; font-size: 8pt; color: #64748b; margin-top: 8px; font-style: italic;">
            Catatan: Promes di atas dihitung berbasis alokasi otomatis ${jpPerMinggu} JP per minggu secara sekuensial.
          </p>
        </div>
      `;
    });
  }

  if (type === "full" || type === "kktp") {
    contentHtml += `
      <div style="${type === 'full' ? 'margin-top: 30px;' : ''}">
        <h2 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 14pt; margin-bottom: 2px; text-transform: uppercase;">
          KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
        </h2>
        <h3 style="text-align: center; font-family: 'Arial', sans-serif; font-size: 12pt; margin-top: 0; margin-bottom: 20px; font-weight: normal;">
          KURIKULUM MERDEKA (METODE RUBRIK PENILAIAN) - TA ${identitas.tahunPelajaran}
        </h3>
        ${headerTable}

        <p style="font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.5; margin-bottom: 12px; font-style: italic; color: #475569;">
          Berikut merupakan instrumen rubrik penilaian KKTP untuk beberapa materi pokok utama demi memetakan capaian pemahaman peserta didik secara andal:
        </p>

        ${results.kktp.map((item, itemIdx) => `
          <div style="margin-bottom: 26px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background-color: #fff;">
            <p style="font-family: 'Arial', sans-serif; font-size: 10.5pt; font-weight: bold; color: #0f172a; margin: 0 0 4px 0;">
              Materi Pokok: ${item.babName}
            </p>
            <p style="font-family: 'Arial', sans-serif; font-size: 9.5pt; color: #0369a1; font-weight: bold; margin: 0 0 10px 0;">
              Indikator Kunci (${item.tpCode}): <span style="font-weight: normal; color: #334155;">${item.tpText}</span>
            </p>

            <table style="width: 100%; border-collapse: collapse; font-family: 'Arial', sans-serif; font-size: 9pt;" border="1" cellpadding="5">
              <thead>
                <tr style="background-color: #f8fafc; font-weight: bold; text-align: center;">
                  <th style="width: 20%; border: 1px solid #cbd5e1;">Aspek Penilaian</th>
                  <th style="width: 20%; border: 1px solid #cbd5e1; background-color: #fef2f2; color: #991b1b;">Baru Berkembang (0-60)</th>
                  <th style="width: 20%; border: 1px solid #cbd5e1; background-color: #fffbeb; color: #92400e;">Layak (61-70)</th>
                  <th style="width: 20%; border: 1px solid #cbd5e1; background-color: #f0fdf4; color: #166534;">Cakap (71-85)</th>
                  <th style="width: 20%; border: 1px solid #cbd5e1; background-color: #ecfdf5; color: #065f46;">Mahir (86-100)</th>
                </tr>
              </thead>
              <tbody>
                ${item.rubrik.map(r => `
                  <tr>
                    <td style="border: 1px solid #cbd5e1; font-weight: bold; background-color: #f8fafc;">${r.aspek}</td>
                    <td style="border: 1px solid #cbd5e1; vertical-align: top; font-size: 8.5pt; font-style: italic; color: #7f1d1d;">${r.baruBerkembang}</td>
                    <td style="border: 1px solid #cbd5e1; vertical-align: top; font-size: 8.5pt; color: #78350f;">${r.layak}</td>
                    <td style="border: 1px solid #cbd5e1; vertical-align: top; font-size: 8.5pt; color: #14532d;">${r.cakap}</td>
                    <td style="border: 1px solid #cbd5e1; vertical-align: top; font-size: 8.5pt; font-weight: 500; color: #064e3b;">${r.mahir}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Formatting closing signature lines for the authentic curriculum layout
  contentHtml += `
    <div style="margin-top: 40px; font-family: 'Arial', sans-serif; font-size: 11pt;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            Mengetahui,<br>
            Kepala Sekolah ${identitas.namaSekolah || "Pendidikan"}<br><br><br><br>
            _______________________________<br>
            NIP.
          </td>
          <td style="width: 50%; vertical-align: top; text-align: right;">
            Probolinggo, ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}<br>
            Guru Mata Pelajaran,<br><br><br><br>
            <strong>${identitas.namaGuru}</strong><br>
            NIP/NUPTK: ${identitas.nuptk || "-"}
          </td>
        </tr>
      </table>
    </div>
  `;

  // Standard Microsoft Word standalone document template wrapper (Office Open XML / MHTML compatible single file)
  const fileContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: a4;
          margin: 2cm 2cm 2cm 2cm;
        }
        body {
          font-family: 'Arial', sans-serif;
          color: #1e293b;
          line-height: 1.4;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px;
        }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", fileContent], {
    type: "application/msword;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.download = `${title}.doc`;
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}
