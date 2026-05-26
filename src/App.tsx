import React, { useState, useEffect } from "react";
import {
  School,
  User,
  Calendar,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Check,
  RotateCcw,
  Download,
  Upload,
  Folder,
  Moon,
  Sun,
  Printer,
  BookOpen,
  Award,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  FileCheck,
  Save,
  FolderOpen
} from "lucide-react";
import { IdentitasPembelajaran, BabMateri, CurriculumResult, SavedProject } from "./types";
import { TEMPLATES } from "./templates";
import { exportToWord } from "./docxExporter";

export default function App() {
  // Gemini API Key state
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("manual_gemini_api_key") || "";
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // Login PIN state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("edu_pin_logged_in") === "true";
  });
  const [pinCode, setPinCode] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Theme dark state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("edu_theme") === "dark";
  });

  // Steps state: 1: Identitas, 2: Jenjang/Mapel, 3: Generate, 4: Preview
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Projects list state
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loadedProjectId, setLoadedProjectId] = useState<string>("");

  // Step 1: Identitas Pembelajaran
  const [identitas, setIdentitas] = useState<IdentitasPembelajaran>({
    namaSekolah: "SMP Muhammadiyah 1 Probolinggo",
    namaGuru: "Aminudin",
    nuptk: "87687987",
    tahunPelajaran: "2024/2025",
    semester: "Ganjil & Genap",
    kurikulum: "Kurikulum Merdeka",
    alamatSekolah: "Jl. Panjaitan No. 4, Probolinggo"
  });

  // Step 2: Jenjang & Mapel
  const [jenjang, setJenjang] = useState<string>("SMP / MTs");
  const [kelas, setKelas] = useState<string>("Kelas 7");
  const [fase, setFase] = useState<string>("Fase D");
  const [mapel, setMapel] = useState<string>("Pendidikan Agama Islam & BP");
  const [customMapel, setCustomMapel] = useState<string>("");
  const [jpPerMinggu, setJpPerMinggu] = useState<number>(3);
  const [mingguEfektif, setMingguEfektif] = useState<number>(18);
  const [tpPerBab, setTpPerBab] = useState<number>(3);
  const [jpPenilaian, setJpPenilaian] = useState<number>(2);

  // Chapters list
  const [babs, setBabs] = useState<BabMateri[]>([
    { id: "1", nama: "Pancasila sebagai Dasar Negara", semester: "1", jp: 12 },
    { id: "2", nama: "Nilai-Nilai Pancasila", semester: "1", jp: 12 },
    { id: "3", nama: "Norma & Hukum", semester: "1", jp: 15 },
    { id: "4", nama: "Hak & Kewajiban Warga Negara", semester: "1", jp: 15 },
    { id: "5", nama: "Iman kepada Hari Akhir", semester: "2", jp: 12 },
    { id: "6", nama: "Akhlak Tercela dan Terpuji", semester: "2", jp: 12 },
    { id: "7", nama: "Ibadah Muamalah", semester: "2", jp: 15 },
    { id: "8", nama: "Khulafaur Rasyidin", semester: "2", jp: 15 },
  ]);

  // Step 3 & 4: Generator status and results
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string>("");
  const [generatedResult, setGeneratedResult] = useState<CurriculumResult | null>(null);
  
  // Preview view choices
  const [activeTab, setActiveTab] = useState<"cp" | "tp" | "atp" | "prota" | "promes" | "kktp" | "summary">("cp");

  // Load Saved projects
  useEffect(() => {
    const list = localStorage.getItem("edu_projects");
    if (list) {
      try {
        const parsed = JSON.parse(list) as SavedProject[];
        setProjects(parsed);
        if (parsed.length > 0) {
          // pre-load the first one if we want, or stay clean
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update theme doc element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("edu_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("edu_theme", "light");
    }
  }, [darkMode]);

  // Handle Fase auto selection
  useEffect(() => {
    if (jenjang === "PAUD / TK") {
      setFase("Fase Fondasi");
      setKelas("Kelas A (4-5 Tahun)");
    } else if (jenjang === "SD / MI") {
      if (kelas === "Kelas 1" || kelas === "Kelas 2") setFase("Fase A");
      else if (kelas === "Kelas 3" || kelas === "Kelas 4") setFase("Fase B");
      else setFase("Fase C");
    } else if (jenjang === "SMP / MTs") {
      setFase("Fase D");
    } else if (jenjang === "SMA / MA" || jenjang === "SMK / MAK") {
      if (kelas === "Kelas 10") setFase("Fase E");
      else setFase("Fase F");
    }
  }, [jenjang, kelas]);

  // Load Preset
  const handleLoadPreset = (key: string) => {
    const preset = TEMPLATES[key];
    if (!preset) return;
    setJenjang(preset.jenjang);
    setKelas(preset.kelas);
    setFase(preset.fase);
    setMapel(preset.mapel);
    setJpPerMinggu(preset.jpPerMinggu);
    setMingguEfektif(preset.mingguEfektif);
    setTpPerBab(preset.tpPerBab);
    setJpPenilaian(preset.jpPenilaian);
    
    // map babs
    const mappedBabs: BabMateri[] = preset.babs.map((b, i) => ({
      id: String(Date.now() + i),
      nama: b.nama,
      semester: b.semester,
      jp: b.jp
    }));
    setBabs(mappedBabs);
  };

  // Add Chapter to lists
  const handleAddBab = (semester: "1" | "2") => {
    const newNo = babs.filter(b => b.semester === semester).length + 1;
    const newBab: BabMateri = {
      id: String(Date.now()),
      nama: `Bab Baru Sem. ${semester} - Bab ${newNo}`,
      semester: semester,
      jp: jpPerMinggu * 4 // default 4 weeks
    };
    setBabs([...babs, newBab]);
  };

  // Remove Chapter
  const handleRemoveBab = (id: string) => {
    setBabs(babs.filter(b => b.id !== id));
  };

  // Update chapter attributes
  const handleUpdateBab = (id: string, field: "nama" | "jp", value: any) => {
    setBabs(
      babs.map(b => {
        if (b.id === id) {
          return { ...b, [field]: field === "jp" ? (Number(value) || 0) : value };
        }
        return b;
      })
    );
  };

  // Save Project state to local storage
  const handleSaveProject = (customTitle?: string) => {
    const title = customTitle || `Rencana_${mapel === "Custom" ? customMapel : mapel}_${kelas}`;
    const newProject: SavedProject = {
      id: loadedProjectId || String(Date.now()),
      title: title,
      savedAt: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      identitas,
      jenjang,
      kelas,
      fase,
      mapel,
      customMapel,
      jpPerMinggu,
      mingguEfektif,
      tpPerBab,
      jpPenilaian,
      babs,
      result: generatedResult
    };

    let updatedProjects = [...projects];
    const matchIdx = projects.findIndex(p => p.id === newProject.id);
    if (matchIdx >= 0) {
      updatedProjects[matchIdx] = newProject;
    } else {
      updatedProjects.push(newProject);
    }

    setProjects(updatedProjects);
    setLoadedProjectId(newProject.id);
    localStorage.setItem("edu_projects", JSON.stringify(updatedProjects));
    alert(`Berhasil menyimpan dokumen "${title}" ke dalam multi-dokumen browser Anda.`);
  };

  // Load project state
  const handleLoadProject = (proj: SavedProject) => {
    setLoadedProjectId(proj.id);
    setIdentitas(proj.identitas);
    setJenjang(proj.jenjang);
    setKelas(proj.kelas);
    setFase(proj.fase);
    setMapel(proj.mapel);
    setCustomMapel(proj.customMapel || "");
    setJpPerMinggu(proj.jpPerMinggu);
    setMingguEfektif(proj.mingguEfektif);
    setTpPerBab(proj.tpPerBab);
    setJpPenilaian(proj.jpPenilaian);
    setBabs(proj.babs);
    setGeneratedResult(proj.result || null);
    if (proj.result) {
      setCurrentStep(4);
    } else {
      setCurrentStep(1);
    }
  };

  // Delete project
  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen dari memori browser?")) return;
    const list = projects.filter(p => p.id !== id);
    setProjects(list);
    localStorage.setItem("edu_projects", JSON.stringify(list));
    if (loadedProjectId === id) {
      setLoadedProjectId("");
      setGeneratedResult(null);
    }
  };

  // Import JSON backup state
  const handleImportState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.identitas && parsed.babs) {
          setIdentitas(parsed.identitas);
          setJenjang(parsed.jenjang || "SMP / MTs");
          setKelas(parsed.kelas || "Kelas 7");
          setFase(parsed.fase || "Fase D");
          setMapel(parsed.mapel || "Pendidikan Agama Islam & BP");
          setCustomMapel(parsed.customMapel || "");
          setJpPerMinggu(parsed.jpPerMinggu || 3);
          setMingguEfektif(parsed.mingguEfektif || 18);
          setTpPerBab(parsed.tpPerBab || 3);
          setJpPenilaian(parsed.jpPenilaian || 2);
          setBabs(parsed.babs || []);
          if (parsed.result) setGeneratedResult(parsed.result);
          alert("Konfigurasi pembelajaran berhasil diimpor!");
        } else {
          alert("Format file tidak valid. Pastikan file adalah file backup EduGen.");
        }
      } catch (err) {
        alert("Gagal membaca file JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Export state JSON to file
  const handleExportStateJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs, result: generatedResult
    }, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `EduGen_Backup_${(mapel === "Custom" ? customMapel : mapel).replace(/\s+/g, "_")}.json`);
    dlAnchor.click();
  };

  // Call API for AI Generation of documents
  const handleGenerateCurriculum = async () => {
    setIsGenerating(true);
    setGenError("");
    try {
      const response = await fetch("/api/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identitas,
          jenjang,
          kelas,
          fase,
          mapel: mapel === "Custom" ? customMapel : mapel,
          jpPerMinggu,
          mingguEfektif,
          tpPerBab,
          jpPenilaian,
          babs,
          customApiKey: geminiApiKey
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedResult(data);
        setCurrentStep(4); // auto route to Step 4: Preview
        // auto save this result
        setTimeout(() => {
          const currentMapelName = mapel === "Custom" ? customMapel : mapel;
          const projTitle = `${currentMapelName}_${kelas}_TA${identitas.tahunPelajaran.replace(/\//g, "-")}`;
          
          const newProject: SavedProject = {
            id: loadedProjectId || String(Date.now()),
            title: projTitle,
            savedAt: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
            identitas,
            jenjang,
            kelas,
            fase,
            mapel,
            customMapel,
            jpPerMinggu,
            mingguEfektif,
            tpPerBab,
            jpPenilaian,
            babs,
            result: data
          };

          let updatedProjects = [...projects];
          const matchIdx = projects.findIndex(p => p.id === newProject.id);
          if (matchIdx >= 0) {
            updatedProjects[matchIdx] = newProject;
          } else {
            updatedProjects.push(newProject);
          }

          setProjects(updatedProjects);
          setLoadedProjectId(newProject.id);
          localStorage.setItem("edu_projects", JSON.stringify(updatedProjects));
        }, 300);
      } else {
        setGenError(data.errorMsg || "Gagal melakukan generate modul.");
      }
    } catch (e: any) {
      setGenError("Terjadi kesalahan koneksi saat memanggil server generator.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Live editing inside direct preview tabs
  const handleEditResultField = (category: "atp" | "kktp" | "tp", index: number, field: string, value: any) => {
    if (!generatedResult) return;
    const copy = { ...generatedResult };
    
    if (category === "atp") {
      copy.atps[index] = { ...copy.atps[index], [field]: value };
    } else if (category === "tp") {
      // split bab to edit lists
      const parentIdx = Math.floor(index / tpPerBab);
      const childIdx = index % tpPerBab;
      if (copy.tps[parentIdx] && copy.tps[parentIdx].tujuanPembelajaran) {
        copy.tps[parentIdx].tujuanPembelajaran[childIdx] = value;
      }
    }
    
    setGeneratedResult(copy);
  };

  const handleEditKKTPField = (itemIdx: number, rubrikIdx: number, field: string, value: string) => {
    if (!generatedResult) return;
    const copy = { ...generatedResult };
    if (copy.kktp[itemIdx]?.rubrik[rubrikIdx]) {
      copy.kktp[itemIdx].rubrik[rubrikIdx] = {
        ...copy.kktp[itemIdx].rubrik[rubrikIdx],
        [field]: value
      };
    }
    setGeneratedResult(copy);
  };

  const handleEditCPField = (value: string) => {
    if (!generatedResult) return;
    setGeneratedResult({
      ...generatedResult,
      cpText: value
    });
  };

  // Calculate sum counts
  const totalJP = babs.reduce((acc, b) => acc + Number(b.jp || 0), 0);
  const matchedMapel = mapel === "Custom" ? customMapel : mapel;

  if (!isLoggedIn) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (pinCode === "085227") {
        setIsLoggedIn(true);
        localStorage.setItem("edu_pin_logged_in", "true");
        setLoginError("");
      } else {
        setLoginError("Kode PIN yang Anda masukkan salah. Hubungi admin.");
      }
    };

    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"}`}>
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700/50 shadow-xs animate-fade-in"
            title="Ubah tema visual"
          >
            {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
        </div>

        <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 animate-fade-in mx-4">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center font-serif text-white font-extrabold text-3xl tracking-widest mx-auto shadow-md shadow-emerald-500/20 mb-4 animate-pulse">
              EG
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              EduGen Pro
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">
              Kurikulum Merdeka 2024/2025
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">
                Akses Kode PIN Pembelajaran
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-lg font-mono tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-xs text-slate-900 dark:text-white"
                  placeholder="------"
                  maxLength={12}
                  autoFocus
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </div>
              </div>
              <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-1.5 text-center">
                Masukkan Kode PIN <span className="font-semibold text-emerald-600 dark:text-emerald-400">085227</span> untuk masuk ke dalam aplikasi.
              </p>
            </div>

            {/* OPTIONAL GEMINI API KEY INPUT ON LOGIN PAGE */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">
                API Key Gemini Anda (Opsional)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGeminiApiKey(val);
                    localStorage.setItem("manual_gemini_api_key", val);
                  }}
                  placeholder="Isi jika ingin menggunakan API Key sendiri (AIzaSy...)"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5 leading-normal">
                Disimpan aman di penyimpanan lokal browser Anda. Jika kosong, sistem akan menggunakan kunci default.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 text-red-750 dark:text-red-400 rounded-xl text-xs flex gap-2 items-center justify-center font-semibold text-center">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider rounded-2xl shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] duration-250"
            >
              <Lock size={14} />
              <span>MASUK DAN MULAI</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
            <p className="font-semibold text-slate-600 dark:text-slate-350">Developed by Bilqis Gaya Hasanah</p>
            <p className="opacity-60 text-slate-400 dark:text-slate-550">Sistem Perangkat Ajar Otomatis Generasi AI</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col ${darkMode ? "dark bg-slate-950 text-slate-100" : ""}`}>
      
      {/* HEADER TOP BAR */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-serif text-white font-bold text-xl tracking-wider">
            EG
          </div>
          <div>
            <h1 id="app-title" className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              EduGen Pro <span className="text-xs font-normal text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200/50">Kurikulum Merdeka</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              CP · TP · ATP · PROTA · PROMES · KKTP
            </p>
          </div>
        </div>

        {/* Global Toolbar Action shortcuts */}
        <div className="flex items-center gap-2">
          {/* Saved Project List dropdown dropdown placeholder */}
          <div className="relative group">
            <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300">
              <FolderOpen size={14} className="text-emerald-600" />
              <span>Buka Dokumen ({projects.length})</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl hidden group-hover:block z-50 p-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100 dark:border-slate-700 mb-1">
                Daftar Dokumen Anda
              </p>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {projects.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400 italic">Belum ada dokumen yang tersimpan</p>
                ) : (
                  projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleLoadProject(p)}
                      className={`p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md cursor-pointer flex items-center justify-between group/item transition-colors ${loadedProjectId === p.id ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/30" : ""}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.title}</p>
                        <p className="text-[9px] text-slate-400">{p.savedAt} · {p.babs.length} bab</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-colors"
                        title="Hapus Dokumen"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveProject()}
            disabled={!babs.length}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300 disabled:opacity-40"
            title="Simpan dokumen saat ini"
          >
            <Save size={14} className="text-blue-500" />
            <span>Simpan</span>
          </button>

          {/* Backup Action buttons */}
          <button
            onClick={handleExportStateJson}
            title="Download cadangan konfigurasi (JSON)"
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Download size={14} />
          </button>

          <label className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer" title="Unggah cadangan konfigurasi (JSON)">
            <Upload size={14} />
            <input type="file" accept=".json" onChange={handleImportState} className="hidden" />
          </label>

          {/* Quick theme selector button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Ubah tema visual"
          >
            {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
                setIsLoggedIn(false);
                localStorage.removeItem("edu_pin_logged_in");
                setPinCode("");
              }
            }}
            className="p-1.5 text-slate-600 dark:text-slate-350 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 rounded-lg transition-colors"
            title="Keluar dari Aplikasi (Logout)"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        
        {/* SIDE NAV - ALUR PENGGUNAAN */}
        <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 no-print">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
              Alur Penggunaan
            </span>
            <p className="text-xs text-slate-400">Ikuti 4 langkah mudah menyusun perangkat ajar Anda:</p>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            {/* Step 1 */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                currentStep === 1
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 1 ? "bg-white text-emerald-700" : "bg-slate-800 text-slate-400"
              }`}>
                1
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${currentStep === 1 ? "text-white" : "text-slate-200"}`}>
                  Identitas Pembelajaran
                </p>
                <p className="text-[10px] opacity-75 mt-0.5">Sekolah, Guru, & TP</p>
              </div>
              {currentStep > 1 && <Check size={14} className="ml-auto mt-1 text-emerald-400" />}
            </button>

            {/* Step 2 */}
            <button
              onClick={() => setCurrentStep(2)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                currentStep === 2
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 2 ? "bg-white text-emerald-700" : "bg-slate-800 text-slate-400"
              }`}>
                2
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${currentStep === 2 ? "text-white" : "text-slate-200"}`}>
                  Jenjang & Urut Mapel
                </p>
                <p className="text-[10px] opacity-75 mt-0.5">Set materi pembelajaran per bab</p>
              </div>
              {currentStep > 2 && <Check size={14} className="ml-auto mt-1 text-emerald-400" />}
            </button>

            {/* Step 3 */}
            <button
              onClick={() => {
                if (babs.length > 0) setCurrentStep(3);
                else alert("Silakan isi materi/bab Anda pada langkah 2 terlebih dahulu!");
              }}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                currentStep === 3
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 3 ? "bg-white text-emerald-700" : "bg-slate-800 text-slate-400"
              }`}>
                3
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${currentStep === 3 ? "text-white" : "text-slate-200"}`}>
                  Generate Dokumen AI
                </p>
                <p className="text-[10px] opacity-75 mt-0.5">Proses otomatisasi perangkat</p>
              </div>
              {generatedResult && <Check size={14} className="ml-auto mt-1 text-emerald-400" />}
            </button>

            {/* Step 4 */}
            <button
              onClick={() => {
                if (generatedResult) setCurrentStep(4);
                else alert("Anda perlu meng-generate dokumen pembelajaran terlebih dahulu sebelum melihat pratinjau!");
              }}
              disabled={!generatedResult}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                currentStep === 4
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                  : "hover:bg-slate-800/60 disabled:opacity-40"
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 4 ? "bg-white text-emerald-700" : "bg-slate-800 text-slate-400"
              }`}>
                4
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${currentStep === 4 ? "text-white" : "text-slate-200"}`}>
                  Pratinjau & Cetak/Ekspor
                </p>
                <p className="text-[10px] opacity-75 mt-0.5">Siap simpan, unduh, dan cetak</p>
              </div>
            </button>

            {/* GEMINI API KEY COMPACT SIDEBAR INPUT */}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2 px-1 flex items-center justify-between">
                <span>API Key Gemini</span>
                <span className="text-[8px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono border border-emerald-900/40">Active</span>
              </span>
              <div className="px-1 relative flex items-center">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGeminiApiKey(val);
                    localStorage.setItem("manual_gemini_api_key", val);
                  }}
                  placeholder="Isi custom API Key (AIzaSy...)"
                  className="w-full pl-2 pr-7 py-2 bg-slate-800 border border-slate-705 rounded-xl text-[11px] text-white outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                >
                  {showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 px-1 leading-tight">
                Disimpan di penyimpanan lokal browser Anda.
              </p>
            </div>

            {/* PRESET LOADERS BOX */}
            <div className="pt-6 mt-6 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2 px-1">
                Gunakan Preset Cepat
              </span>
              <div className="space-y-1.5 px-1 max-h-56 overflow-y-auto">
                {Object.keys(TEMPLATES).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleLoadPreset(key);
                      alert(`Preset "${TEMPLATES[key].name}" berhasil dimuat! Anda sekarang berada pada identitas sekolah.`);
                    }}
                    className="w-full text-left py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 hover:text-white truncate block transition-colors border border-slate-700/50"
                    title={TEMPLATES[key].name}
                  >
                    🚀 {TEMPLATES[key].name}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-4 bg-slate-950 border-t border-slate-800 text-slate-400 text-[10px] leading-tight">
            <p>Developed by:</p>
            <span className="text-emerald-400 font-semibold block text-xs mt-0.5">Bilqis Gaya Hasanah</span>
            <p className="opacity-45 mt-2">Versi Kurikulum Merdeka 2024</p>
          </div>
        </aside>

        {/* MAIN PANEL AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-100/50 dark:bg-slate-950/20 p-4 lg:p-6 overflow-y-auto">
          
          {/* STEP 1: IDENTITAS PEMBELAJARAN FORM */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <School size={20} />
                </div>
                <div>
                  <h2 className="text-md font-bold text-slate-900 dark:text-white">1. Identitas Administrasi Pembelajaran</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Input data sekolah, kurikulum, dan informasi pendidik yang akan tercetak sebagai kop dokumen resmi.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Nama Sekolah *</label>
                  <input
                    type="text"
                    value={identitas.namaSekolah}
                    onChange={(e) => setIdentitas({ ...identitas, namaSekolah: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    placeholder="Contoh: SMP Negeri 1 Jakarta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Nama Lengkap Guru *</label>
                  <input
                    type="text"
                    value={identitas.namaGuru}
                    onChange={(e) => setIdentitas({ ...identitas, namaGuru: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    placeholder="Contoh: Aminudin, S.Pd."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={identitas.nuptk}
                    onChange={(e) => setIdentitas({ ...identitas, nuptk: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    placeholder="Isi jika ada, atau kosongkan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Tahun Pelajaran *</label>
                  <input
                    type="text"
                    value={identitas.tahunPelajaran}
                    onChange={(e) => setIdentitas({ ...identitas, tahunPelajaran: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    placeholder="Contoh: 2024/2025"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Semester target *</label>
                  <select
                    value={identitas.semester}
                    onChange={(e: any) => setIdentitas({ ...identitas, semester: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none"
                  >
                    <option value="Ganjil">Khas Semester Ganjil</option>
                    <option value="Genap">Khas Semester Genap</option>
                    <option value="Ganjil & Genap">Ganjil & Genap (Setahun Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Dasar Regulasi Kurikulum</label>
                  <input
                    type="text"
                    value={identitas.kurikulum}
                    disabled
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Alamat Sekolah</label>
                  <textarea
                    rows={2}
                    value={identitas.alamatSekolah}
                    onChange={(e) => setIdentitas({ ...identitas, alamatSekolah: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white resize-none"
                    placeholder="Tuliskan jalan, kota, atau provinsi sekolah"
                  />
                </div>
              </div>

              {/* Progress Navigation Buttons */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div>
                  {projects.length > 0 && (
                    <p className="text-[10px] text-slate-400 italic">Ada {projects.length} dokumen tersimpan di browser Anda</p>
                  )}
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/20"
                >
                  <span>Lanjut ke Pemilihan Jenjang</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: JENJANG & URUTAN MATERI MAPEL */}
          {currentStep === 2 && (
            <div className="max-w-6xl mx-auto w-full space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-slate-900 dark:text-white">2. Pilih Jenjang & Konfigurasi Jam Pelajaran</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pilih rentang tingkatan sekolah dan alokasikan pembagian jam target serta semester efektif.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Jenjang Pendidikan *</label>
                    <select
                      value={jenjang}
                      onChange={(e) => setJenjang(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    >
                      <option value="PAUD / TK">PAUD / TK (Fase Fondasi)</option>
                      <option value="SD / MI">SD / MI</option>
                      <option value="SMP / MTs">SMP / MTs</option>
                      <option value="SMA / MA">SMA / MA</option>
                      <option value="SMK / MAK">SMK / MAK (Kejuruan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Kelas *</label>
                    {jenjang === "PAUD / TK" ? (
                      <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white">
                        <option value="Kelas A (4-5 Tahun)">Kelas A (4-5 Tahun)</option>
                        <option value="Kelas B (5-6 Tahun)">Kelas B (5-6 Tahun)</option>
                      </select>
                    ) : jenjang === "SD / MI" ? (
                      <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white">
                        <option value="Kelas 1">Kelas 1</option>
                        <option value="Kelas 2">Kelas 2</option>
                        <option value="Kelas 3">Kelas 3</option>
                        <option value="Kelas 4">Kelas 4</option>
                        <option value="Kelas 5">Kelas 5</option>
                        <option value="Kelas 6">Kelas 6</option>
                      </select>
                    ) : jenjang === "SMP / MTs" ? (
                      <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white">
                        <option value="Kelas 7">Kelas 7</option>
                        <option value="Kelas 8">Kelas 8</option>
                        <option value="Kelas 9">Kelas 9</option>
                      </select>
                    ) : (
                      <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white">
                        <option value="Kelas 10">Kelas 10</option>
                        <option value="Kelas 11">Kelas 11</option>
                        <option value="Kelas 12">Kelas 12</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Fase Kurikulum</label>
                    <input
                      type="text"
                      value={fase}
                      disabled
                      className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Mata Pelajaran *</label>
                    <select
                      value={mapel}
                      onChange={(e) => setMapel(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium text-emerald-700 dark:text-emerald-400"
                    >
                      <option value="Pendidikan Agama Islam & BP">Pendidikan Agama Islam & BP</option>
                      <option value="Pancasila (PPKn)">Pancasila (PPKn)</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                      <option value="Ilmu Pengetahuan Sosial (IPS)">Ilmu Pengetahuan Sosial (IPS)</option>
                      <option value="Bahasa Inggris">Bahasa Inggris</option>
                      <option value="Dasar-Dasar Kejuruan RPL">Dasar-Dasar Kejuruan RPL</option>
                      <option value="Custom">-- Input Mapel Kustom Sendiri --</option>
                    </select>
                  </div>
                </div>

                {mapel === "Custom" && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-900/30 rounded-xl">
                    <label className="block text-[11px] font-bold text-yellow-800 dark:text-yellow-400 uppercase mb-1.5 tracking-wider">Ketik Nama Mata Pelajaran Kustom Anda *</label>
                    <input
                      type="text"
                      value={customMapel}
                      onChange={(e) => setCustomMapel(e.target.value)}
                      className="w-full md:w-1/2 p-2.5 bg-white dark:bg-slate-800 border border-yellow-300 dark:border-yellow-800 rounded-lg text-xs"
                      placeholder="Misal: Seni Musik Budaya Lokal, Coding dasar, dll"
                    />
                  </div>
                )}

                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">JP per Minggu *</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={jpPerMinggu}
                      onChange={(e) => setJpPerMinggu(Number(e.target.value) || 3)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Minggu Efektif per Sem. *</label>
                    <input
                      type="number"
                      min={10}
                      max={22}
                      value={mingguEfektif}
                      onChange={(e) => setMingguEfektif(Number(e.target.value) || 18)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Target TP per Bab *</label>
                    <select
                      value={tpPerBab}
                      onChange={(e) => setTpPerBab(Number(e.target.value) || 3)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    >
                      <option value="2">2 TP per Bab</option>
                      <option value="3">3 TP per Bab (Rekomendasi)</option>
                      <option value="4">4 TP per Bab</option>
                      <option value="5">5 TP per Bab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">JP Penilaian Sumatif / Bab *</label>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={jpPenilaian}
                      onChange={(e) => setJpPenilaian(Number(e.target.value) || 2)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* MANUAL LIST BAB INTERFACE EDITOR */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>Daftar Materi Pokok & Jam Pelajaran per Bab</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
                        Total {babs.length} Bab · {totalJP} JP Setahun
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Ubah nama bab, pilih semester ajarnya, dan set alokasi JP. Klik tombol tambah untuk menambahkan bab materi baru.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddBab("1")}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all"
                    >
                      <Plus size={12} />
                      <span>+ Bab Semester 1</span>
                    </button>
                    <button
                      onClick={() => handleAddBab("2")}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all"
                    >
                      <Plus size={12} />
                      <span>+ Bab Semester 2</span>
                    </button>
                  </div>
                </div>

                {/* Grid Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  
                  {/* SEMESTER 1 BOX */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-dashed border-slate-250 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      <span>Semester 1 (Ganjil) — {babs.filter(b => b.semester === '1').length} Bab</span>
                    </h4>

                    <div className="space-y-2.5">
                      {babs.filter(b => b.semester === "1").length === 0 ? (
                        <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada materi semester 1. Klik "+ Bab Semester 1" di atas.</p>
                      ) : (
                        babs.filter(b => b.semester === "1").map((bab, idx) => (
                          <div key={bab.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                            <span className="text-[11px] font-bold text-slate-400 shrink-0">Bab {idx + 1}</span>
                            <input
                              type="text"
                              value={bab.nama}
                              onChange={(e) => handleUpdateBab(bab.id, "nama", e.target.value)}
                              className="bg-transparent text-xs text-slate-800 dark:text-white border-b border-transparent hover:border-slate-200/50 focus:border-emerald-500 outline-none flex-1 font-medium"
                              placeholder="Ketik topik materi/bab..."
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="number"
                                min={2}
                                max={60}
                                value={bab.jp}
                                onChange={(e) => handleUpdateBab(bab.id, "jp", e.target.value)}
                                className="w-12 text-center text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5"
                                title="Alokasi Jam Pelajaran (JP)"
                              />
                              <span className="text-[10px] text-slate-400">JP</span>
                            </div>
                            <button
                              onClick={() => handleRemoveBab(bab.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 p-1 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* SEMESTER 2 BOX */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-dashed border-slate-250 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                      <span>Semester 2 (Genap) — {babs.filter(b => b.semester === '2').length} Bab</span>
                    </h4>

                    <div className="space-y-2.5">
                      {babs.filter(b => b.semester === "2").length === 0 ? (
                        <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada materi semester 2. Klik "+ Bab Semester 2" di atas.</p>
                      ) : (
                        babs.filter(b => b.semester === "2").map((bab, idx) => (
                          <div key={bab.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                            <span className="text-[11px] font-bold text-slate-400 shrink-0">Bab {idx + 1 + babs.filter(b => b.semester === '1').length}</span>
                            <input
                              type="text"
                              value={bab.nama}
                              onChange={(e) => handleUpdateBab(bab.id, "nama", e.target.value)}
                              className="bg-transparent text-xs text-slate-800 dark:text-white border-b border-transparent hover:border-slate-200/50 focus:border-emerald-500 outline-none flex-1 font-medium"
                              placeholder="Ketik topik materi/bab..."
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="number"
                                min={2}
                                max={60}
                                value={bab.jp}
                                onChange={(e) => handleUpdateBab(bab.id, "jp", e.target.value)}
                                className="w-12 text-center text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5"
                                title="Alokasi Jam Pelajaran (JP)"
                              />
                              <span className="text-[10px] text-slate-400">JP</span>
                            </div>
                            <button
                              onClick={() => handleRemoveBab(bab.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 p-1 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Trigger Buttons */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft size={14} />
                    <span>Kembali ke Identitas</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (babs.length === 0) {
                        alert("Silakan tambahkan minimal 1 bab materi terlebih dahulu sebelum lanjut!");
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-950/20"
                  >
                    <span>Lanjut ke Proses Generate AI</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: AUTOMATIC GENERATOR TRIGGER PANEL */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-md font-bold text-slate-900 dark:text-white">3. Tinjau Ringkasan & Mulai Generate Dokumen</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pastikan seluruh data per bab dan kelas yang diinput telah benar untuk diproses oleh kecerdasan buatan.</p>
                </div>
              </div>

              {/* GEMINI API KEY INPUT */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-xs">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider flex items-center justify-between">
                  <span>Akses API Key Gemini (Opsional)</span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold font-mono border border-emerald-250/30">Local Storage Active</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGeminiApiKey(val);
                      localStorage.setItem("manual_gemini_api_key", val);
                    }}
                    placeholder="Masukkan API Key Gemini Anda di sini jika ada (AIzaSy...)"
                    className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 lines-leading-relaxed">
                  Gunakan API Key Anda sendiri jika ingin melakukan ribuan kali pergerakan dokumen tanpa limits. API Key Anda disimpan seutuhnya di penyimpanan lokal browser.
                </p>
              </div>

              {/* Grid Specifications Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-xs mb-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Nama Sekolah</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{identitas.namaSekolah}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Guru Pengampu</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{identitas.namaGuru}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Jenjang & Tingkat</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{jenjang} ({kelas})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Mata Pelajaran</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{matchedMapel}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Tahun Pelajaran / Semester</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 text-xs">{identitas.tahunPelajaran} / {identitas.semester}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Jumlah Sesi & Bab</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{babs.length} Bab ({totalJP} JP)</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl space-y-2 mb-6">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check size={14} className="shrink-0 text-emerald-600" />
                  <span>Kecerdasarn Kurikulum Merdeka Terkalibrasi</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  Mesin kecerdasan buatan kami akan merumuskan Capaian Pembelajaran (CP) berdasarkan Kepka BSKAP No. 032/H/KR/2024, Tujuan Pembelajaran (TP) terstruktur formula ABCD & SMART, menyusun urutan Alur Tujuan Pembelajaran (ATP) lengkap dengan justifikasi logis, menyusun Prota/Promes mingguan, serta KKTP format rubrik penilaian.
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono italic">
                  * Integrasi aman menggunakan SDK Google GenAI Gemini-3.5-Flash.
                </p>
              </div>

              {genError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs flex gap-2 items-start mb-6">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <p>{genError}</p>
                </div>
              )}

              {/* Progress and status message */}
              {isGenerating ? (
                <div className="text-center py-10 space-y-4">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse font-mono">
                    Sedang Merancang Administrasi Kurikulum Merdeka...
                  </p>
                  <p className="text-[10px] text-slate-400">Proses ini memakan waktu kurang lebih 10-25 detik.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleGenerateCurriculum}
                    className="w-full py-3.5 bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>PROSES & GENERATE PERANGKAT AJAR SEKARANG</span>
                  </button>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs text-slate-500 font-medium"
                    >
                      ← Edit Bab & Materi
                    </button>
                    {generatedResult && (
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Lihat Hasil Terakhir</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PREVIEW & LIVE EDIT / EXPORT COMPONENT DISPLAY */}
          {currentStep === 4 && generatedResult && (
            <div className="space-y-6 max-w-7xl mx-auto w-full">
              
              {/* Document toolbar switches */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("cp")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "cp"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    📄 CP (Capaian)
                  </button>
                  <button
                    onClick={() => setActiveTab("tp")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "tp"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    🎯 TP (Tujuan)
                  </button>
                  <button
                    onClick={() => setActiveTab("atp")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "atp"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    ⚡ ATP (Alur Tujuan)
                  </button>
                  <button
                    onClick={() => setActiveTab("prota")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "prota"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    📅 Prota (Tahunan)
                  </button>
                  <button
                    onClick={() => setActiveTab("promes")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "promes"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    🗓 Promes (Semester)
                  </button>
                  <button
                    onClick={() => setActiveTab("kktp")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "kktp"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    🏅 KKTP (Kriteria)
                  </button>
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "summary"
                        ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    📊 Rincian Alokasi
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 font-bold rounded-lg flex items-center gap-1"
                  >
                    <Printer size={13} />
                    <span>Print</span>
                  </button>

                  <div className="relative group/dl">
                    <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <Download size={13} />
                      <span>Ekspor Word .docx</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover/dl:block z-50 w-56">
                      <button
                        onClick={() => exportToWord({ id: loadedProjectId, title: "", savedAt: "", identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs }, generatedResult, "full")}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700/50 block font-bold text-slate-800 dark:text-white"
                      >
                        📦 Unduh Dokumen Lengkap (Semua)
                      </button>
                      <button
                        onClick={() => exportToWord({ id: loadedProjectId, title: "", savedAt: "", identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs }, generatedResult, "cp_tp")}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700/50 block"
                      >
                        📄 Unduh CP & TP Saja
                      </button>
                      <button
                        onClick={() => exportToWord({ id: loadedProjectId, title: "", savedAt: "", identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs }, generatedResult, "atp")}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700/50 block"
                      >
                        ⚡ Unduh Dokumen ATP
                      </button>
                      <button
                        onClick={() => exportToWord({ id: loadedProjectId, title: "", savedAt: "", identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs }, generatedResult, "prota")}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700/50 block"
                      >
                        📅 Unduh Prota (Program Tahunan)
                      </button>
                      <button
                        onClick={() => exportToWord({ id: loadedProjectId, title: "", savedAt: "", identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs }, generatedResult, "promes")}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700/50 block"
                      >
                        🗓 Unduh Promes Semester
                      </button>
                      <button
                        onClick={() => exportToWord({ id: loadedProjectId, title: "", savedAt: "", identitas, jenjang, kelas, fase, mapel, customMapel, jpPerMinggu, mingguEfektif, tpPerBab, jpPenilaian, babs }, generatedResult, "kktp")}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700/50 block"
                      >
                        🏅 Unduh KKTP Rubrik
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CORE PAPER SIMULATION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 rounded-sm text-slate-800 dark:text-slate-100 max-w-5xl mx-auto print-page">
                
                {/* School kop header */}
                <div className="border-b-4 double border-slate-900 dark:border-slate-100 pb-4 mb-6 text-center">
                  <h3 className="text-md uppercase font-extrabold tracking-wide text-slate-900 dark:text-white">
                    PEMERINTAH KOTA / KABUPATEN PROBOLINGGO
                  </h3>
                  <h2 className="text-lg uppercase font-black text-slate-900 dark:text-white tracking-widest mt-0.5">
                    {identitas.namaSekolah || "SEKOLAH MATA PELAJARAN"}
                  </h2>
                  <p className="text-xs italic text-slate-500 mt-1 dark:text-gray-400">
                    Alamat: {identitas.alamatSekolah || "Jl. Pendidikan Nasional No. 1, Probolinggo"}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-md">
                  <div>
                    <p className="text-slate-400 uppercase text-[9px] font-bold">Guru Pengampu:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{identitas.namaGuru} {identitas.nuptk ? `(NIP/NUPTK: ${identitas.nuptk})` : ""}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase text-[9px] font-bold">Mata Pelajaran / Sesi:</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{matchedMapel} ({kelas} - {fase})</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase text-[9px] font-bold">Tahun Pelajaran / Semester:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{identitas.tahunPelajaran} / Semester: {identitas.semester}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase text-[9px] font-bold">Sistem Perhitungan:</p>
                    <p className="font-bold text-slate-900 dark:text-white">{jpPerMinggu} JP/minggu x {mingguEfektif} Minggu Efektif ({totalJP} JP Setahun)</p>
                  </div>
                </div>

                {/* TAB 1: CAPAIAN PEMBELAJARAN (CP) */}
                {activeTab === "cp" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5 flex justify-between items-center">
                      <span>Capaian Pembelajaran (CP) - Kepka BSKAP No. 032/H/KR/2024</span>
                      <span className="text-[10px] text-slate-400 italic normal-case font-mono no-print">Klik di dalam box untuk langsung edit teks CP</span>
                    </h3>
                    <textarea
                      value={generatedResult.cpText}
                      onChange={(e) => handleEditCPField(e.target.value)}
                      className="w-full min-h-[220px] p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-sans"
                    />
                  </div>
                )}

                {/* TAB 2: TUJUAN PEMBELAJARAN (TP) */}
                {activeTab === "tp" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5 flex justify-between items-center">
                      <span>Tujuan Pembelajaran (TP) per Bab (ABCD & SMART Formulation)</span>
                      <span className="text-[10px] text-slate-400 italic normal-case font-mono no-print">Klik teks TP untuk mengedit langsung</span>
                    </h3>
                    <div className="space-y-5">
                      {generatedResult.tps.map((babTp, bIdx) => (
                        <div key={bIdx} className="bg-slate-50 dark:bg-slate-800/45 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700">
                          <p className="text-xs font-extrabold text-slate-800 dark:text-white mb-2 pb-1 border-b border-slate-200/50">
                            Semester {babTp.semester} · {babTp.babName}
                          </p>
                          <div className="space-y-2">
                            {babTp.tujuanPembelajaran.map((tpStr, tpIdx) => {
                              const overallIdx = bIdx * tpPerBab + tpIdx;
                              return (
                                <div key={tpIdx} className="flex gap-2">
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono shrink-0">TP {kelas.replace(/\D/g,"") || "7"}.{bIdx + 1}.{tpIdx + 1}:</span>
                                  <input
                                    type="text"
                                    value={tpStr}
                                    onChange={(e) => handleEditResultField("tp", overallIdx, "", e.target.value)}
                                    className="w-full bg-transparent text-xs text-slate-800 dark:text-white border-b border-transparent hover:border-slate-250 dark:hover:border-slate-700 focus:border-emerald-500 outline-none pb-0.5"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: ALUR TUJUAN PEMBELAJARAN (ATP) */}
                {activeTab === "atp" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5 flex justify-between items-center">
                      <span>Alur Tujuan Pembelajaran (ATP) - Pengurutan Logis</span>
                      <span className="text-[10px] text-slate-400 italic normal-case font-mono no-print">Tabel dapat diedit langsung</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-700">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 font-bold dark:text-white text-center">
                            <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-20">Kode ATP</th>
                            <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-16">Kode TP</th>
                            <th className="border border-slate-300 dark:border-slate-700 p-2.5">Rumusan Tujuan Pembelajaran</th>
                            <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-16">Alokasi</th>
                            <th className="border border-slate-300 dark:border-slate-700 p-2.5">Justifikasi Penyusunan Alur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedResult.atps.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{item.code}</td>
                              <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold">{item.tpCode}</td>
                              <td className="border border-slate-300 dark:border-slate-700 p-2 font-mono">
                                <textarea
                                  value={item.tpText}
                                  onChange={(e) => handleEditResultField("atp", idx, "tpText", e.target.value)}
                                  className="w-full text-xs bg-transparent border-none outline-none resize-none font-sans"
                                  rows={2}
                                />
                              </td>
                              <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold">
                                <input
                                  type="number"
                                  value={item.alokasiJP}
                                  onChange={(e) => handleEditResultField("atp", idx, "alokasiJP", Number(e.target.value) || 2)}
                                  className="w-10 text-center bg-transparent border border-transparent hover:border-slate-350 dark:hover:border-slate-650"
                                />
                                <span className="text-[10px] text-slate-400 block font-normal">JP</span>
                              </td>
                              <td className="border border-slate-300 dark:border-slate-700 p-2 text-slate-550 dark:text-slate-350 italic">
                                <textarea
                                  value={item.justifikasi}
                                  onChange={(e) => handleEditResultField("atp", idx, "justifikasi", e.target.value)}
                                  className="w-full text-xs bg-transparent border-none outline-none resize-none"
                                  rows={2}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: PROGRAM TAHUNAN (PROTA) */}
                {activeTab === "prota" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5">
                      Program Tahunan (PROTA) Setahun Penuh
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-700 text-left">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold text-center">
                            <th className="border border-slate-700 p-2.5 w-24">Semester</th>
                            <th className="border border-slate-700 p-2.5 w-16">Bab No.</th>
                            <th className="border border-slate-700 p-2.5">Agenda / Materi Pokok Pembelajaran</th>
                            <th className="border border-slate-700 p-2.5 w-32">Struktur Alokasi JP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Semester 1 entries */}
                          {babs.filter(b => b.semester === "1").map((b, bIdx) => (
                            <tr key={b.id}>
                              {bIdx === 0 && (
                                <td
                                  rowspan={babs.filter(s => s.semester === "1").length}
                                  className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-bold bg-slate-50 dark:bg-slate-800/40"
                                >
                                  Ganjil (Semester 1)
                                </td>
                              )}
                              <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-mono">Bab {bIdx + 1}</td>
                              <td className="border border-slate-300 dark:border-slate-700 p-2.5 font-semibold text-slate-900 dark:text-white">{b.nama}</td>
                              <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                {b.jp} JP (Ketuntasan)
                              </td>
                            </tr>
                          ))}

                          {/* Semester 2 entries */}
                          {babs.filter(b => b.semester === "2").map((b, bIdx) => {
                            const sem1Count = babs.filter(s => s.semester === "1").length;
                            return (
                              <tr key={b.id}>
                                {bIdx === 0 && (
                                  <td
                                    rowspan={babs.filter(s => s.semester === "2").length}
                                    className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-bold bg-slate-50 dark:bg-slate-800/40"
                                  >
                                    Genap (Semester 2)
                                  </td>
                                )}
                                <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-mono">Bab {bIdx + 1 + sem1Count}</td>
                                <td className="border border-slate-300 dark:border-slate-700 p-2.5 font-semibold text-slate-900 dark:text-white">{b.nama}</td>
                                <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                  {b.jp} JP (Ketuntasan)
                                </td>
                              </tr>
                            );
                          })}

                          <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                            <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-right" colspan="3">Total Hubungan Alokasi Seluruh Bab Setahun:</td>
                            <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center text-sm text-emerald-700 dark:text-emerald-400">
                              {totalJP} Jam Pelajaran (JP)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 5: PROGRAM SEMESTER (PROMES) */}
                {activeTab === "promes" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5 flex justify-between items-center">
                      <span>Program Semester (Promes) - Alokasi JP per Minggu Efektif</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">Beban Sesi Mingguan: {jpPerMinggu} JP</span>
                    </h3>

                    {/* Rendering breakdown per semester */}
                    {["1", "2"].map((sem) => {
                      const list = generatedResult.weeksDistribution.filter(w => w.semester === sem);
                      if (list.length === 0) return null;
                      return (
                        <div key={sem} className="space-y-3">
                          <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                            Semester {sem === "1" ? "1 - Ganjil" : "2 - Genap"} — Rencana Tatap Muka
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px] border-collapse border border-slate-300 dark:border-slate-700 text-left">
                              <thead>
                                <tr className="bg-slate-900 text-white font-bold text-center">
                                  <th className="border border-slate-700 p-1.5 w-10">No</th>
                                  <th className="border border-slate-700 p-1.5">Mata Pelajaran / Materi Bab</th>
                                  <th className="border border-slate-700 p-1.5 w-16">Total JP</th>
                                  <th className="border border-slate-700 p-1.5" colspan="18">Minggu Efektif Ke- (Sesi Belajar)</th>
                                </tr>
                                <tr className="bg-slate-800 text-white text-[9px] text-center font-bold">
                                  <th className="border border-slate-700 p-1" colspan="3">-</th>
                                  {Array.from({ length: 18 }, (_, k) => (
                                    <th key={k} className="border border-slate-700 p-1 w-6">{k + 1}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {list.map((dist, idx) => {
                                  const associatedBab = babs.find(b => b.nama === dist.babName);
                                  const dbbJP = associatedBab ? associatedBab.jp : 12;
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35">
                                      <td className="border border-slate-300 dark:border-slate-700 p-1.5 text-center font-bold">{idx + 1}</td>
                                      <td className="border border-slate-300 dark:border-slate-700 p-1.5 font-medium">{dist.babName}</td>
                                      <td className="border border-slate-300 dark:border-slate-700 p-1.5 text-center font-bold bg-slate-50/50 dark:bg-slate-900">{dbbJP} JP</td>
                                      {dist.weeks.map((val, weekIdx) => {
                                        const hasVal = val > 0;
                                        return (
                                          <td
                                            key={weekIdx}
                                            className={`border border-slate-300 dark:border-slate-700 p-1 text-[11px] text-center font-extrabold ${hasVal ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-300 dark:text-slate-700'}`}
                                          >
                                            {hasVal ? val : "-"}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                                {/* Sum row per week */}
                                <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-center">
                                  <td className="border border-slate-300 dark:border-slate-700 p-1.5 text-right" colspan="2">Jumlah JP Mingguan:</td>
                                  <td className="border border-slate-300 dark:border-slate-700 p-1.5 bg-slate-200/50 dark:bg-slate-700">
                                    {list.reduce((sum, dist) => {
                                      const associated = babs.find(b => b.nama === dist.babName);
                                      return sum + (associated ? Number(associated.jp) : 12);
                                    }, 0)}
                                  </td>
                                  {Array.from({ length: 18 }, (_, wIdx) => {
                                    const wSum = list.reduce((s, d) => s + (d.weeks[wIdx] || 0), 0);
                                    const isExcess = wSum > jpPerMinggu;
                                    return (
                                      <td
                                        key={wIdx}
                                        className={`border border-slate-300 dark:border-slate-700 p-1 text-[11px] ${isExcess ? 'bg-red-100 text-red-600' : 'bg-slate-200/50 dark:bg-slate-700/60'}`}
                                      >
                                        {wSum || "-"}
                                      </td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 6: KRITERIA KETERCAPAIAN TUJUAN (KKTP) */}
                {activeTab === "kktp" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5 flex justify-between items-center">
                      <span>Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) - Metode Rubrik Penilaian</span>
                      <span className="text-[10px] text-slate-400 italic normal-case font-mono no-print">Teks deskripsi kriteria di dalam rubrik sangat fleksibel dan dapat diedit langsung</span>
                    </h3>

                    <div className="space-y-6">
                      {generatedResult.kktp.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-705 p-4 rounded-xl">
                          <p className="text-xs font-black text-slate-900 dark:text-white mb-2">Tema/Materi Pokok: <span className="text-emerald-600 dark:text-emerald-400">{item.babName}</span></p>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 block">
                            Indikator Kompetensi ({item.tpCode}): <span className="text-slate-750 dark:text-slate-300 font-normal">{item.tpText}</span>
                          </p>

                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left border-collapse border border-slate-300 dark:border-slate-700">
                              <thead>
                                <tr className="bg-slate-100 dark:bg-slate-850 font-bold text-center">
                                  <th className="border border-slate-300 dark:border-slate-700 p-2 w-28">Aspek</th>
                                  <th className="border border-slate-300 dark:border-slate-700 p-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">Baru Berkembang (0-60)</th>
                                  <th className="border border-slate-300 dark:border-slate-700 p-2 bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400">Layak (61-70)</th>
                                  <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-750 dark:text-emerald-400">Cakap (71-85)</th>
                                  <th className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300">Mahir (86-100)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.rubrik.map((r, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                    <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold bg-slate-50 dark:bg-slate-900/50">{r.aspek}</td>
                                    <td className="border border-slate-300 dark:border-slate-700 p-2 italic text-red-900 dark:text-red-300">
                                      <textarea
                                        value={r.baruBerkembang}
                                        onChange={(e) => handleEditKKTPField(itemIdx, rIdx, "baruBerkembang", e.target.value)}
                                        className="w-full text-[11px] bg-transparent border-none outline-none resize-none font-sans"
                                        rows={3}
                                      />
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-amber-800 dark:text-amber-300">
                                      <textarea
                                        value={r.layak}
                                        onChange={(e) => handleEditKKTPField(itemIdx, rIdx, "layak", e.target.value)}
                                        className="w-full text-[11px] bg-transparent border-none outline-none resize-none font-sans"
                                        rows={3}
                                      />
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-emerald-800 dark:text-emerald-300">
                                      <textarea
                                        value={r.cakap}
                                        onChange={(e) => handleEditKKTPField(itemIdx, rIdx, "cakap", e.target.value)}
                                        className="w-full text-[11px] bg-transparent border-none outline-none resize-none font-sans"
                                        rows={3}
                                      />
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 p-2 font-semibold text-emerald-950 dark:text-emerald-300">
                                      <textarea
                                        value={r.mahir}
                                        onChange={(e) => handleEditKKTPField(itemIdx, rIdx, "mahir", e.target.value)}
                                        className="w-full text-[11px] bg-transparent border-none outline-none resize-none font-sans"
                                        rows={3}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 7: ALLOCATION SUMMARY / RINCIAN */}
                {activeTab === "summary" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b-2 border-emerald-600 pb-1.5">
                      Rincian Alokasi Perangkat Kurikulum
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl space-y-2">
                        <p className="font-bold text-slate-800 dark:text-white">Alokasi Waktu Jam Pelajaran (JP):</p>
                        <p>· Total Jam Pelajaran: <strong className="text-emerald-650 font-bold">{totalJP} JP</strong> setahun penuh.</p>
                        <p>· Sesi per Minggu: <strong>{jpPerMinggu} JP</strong> pelajaran.</p>
                        <p>· Durasi per 1 JP: <strong>{jenjang === "PAUD / TK" ? "30" : jenjang === "SD / MI" ? "35" : jenjang === "SMP / MTs" ? "40" : "45"} menit</strong> tatap muka.</p>
                        <p>· Estimasi Tatap Muka: <strong>{totalJP * (jenjang === "PAUD / TK" ? 30 : jenjang === "SD / MI" ? 35 : jenjang === "SMP / MTs" ? 40 : 45)} menit</strong> total pengajaran.</p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl space-y-2">
                        <p className="font-bold text-slate-800 dark:text-white">Estimasi Pertemuan Efektif:</p>
                        <p>· Total Minggu Efektif: <strong>{mingguEfektif} minggu</strong> per semester.</p>
                        <p>· Penilaian Sumatif Terjadwal: <strong>{jpPenilaian} JP</strong> per bab.</p>
                        <p>· Kelayakan Target: <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-bold rounded">AMAT BAIK</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Human validator signatures */}
                <div className="mt-12 pt-6 border-t border-slate-300 dark:border-slate-700 flex flex-col md:flex-row justify-between text-xs text-slate-755 dark:text-slate-350">
                  <div className="space-y-1 mt-4 md:mt-0">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah {identitas.namaSekolah}</p>
                    <br /><br /><br />
                    <p className="border-t border-slate-400 pt-1 w-48 font-bold">_________________________</p>
                    <p className="text-[10px] text-slate-400">NIP. .............................</p>
                  </div>
                  
                  <div className="space-y-1 text-right mt-6 md:mt-0">
                    <p>Probolinggo, {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <p>Guru Mata Pelajaran,</p>
                    <br /><br /><br />
                    <p className="font-extrabold text-slate-900 dark:text-white">{identitas.namaGuru}</p>
                    <p className="text-[10px] text-slate-400">NIP/NUPTK: {identitas.nuptk || "............................."}</p>
                  </div>
                </div>

              </div>

              {/* Reset to inputs button */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm no-print">
                <button
                  onClick={() => {
                    if (confirm("Apakah Anda ingin kembali ke pengaturan bab dan identitas? Perangkat ajar yang di-generate tidak akan hilang.")) {
                      setCurrentStep(2);
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw size={13} />
                  <span>Mulai Ulang / Edit Pengaturan</span>
                </button>

                <p className="text-[11px] font-medium text-slate-400 italic">
                  * Untuk mengedit konten di atas, silakan klik langsung di kolom teks yang sesuai.
                </p>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* FOOTER WARNING / INSTRUCTION */}
      <footer className="bg-slate-250 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-500 font-medium no-print">
        <div className="flex gap-4">
          <span>Sistem: <strong className="text-slate-800 dark:text-white">EduGen Pro v2.4 (Kepka BSKAP No. 032/H/KR/2024)</strong></span>
          <span>Status Sinyal: <strong className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">● LIVE ONLINE</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle size={10} className="text-amber-500" />
          <span>Sangat disarankan melakukan verifikasi silang dokumen di portal resmi: <a href="https://guru.kemendikdasmen.go.id" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800 dark:hover:text-white">guru.kemendikdasmen.go.id</a></span>
        </div>
      </footer>
    </div>
  );
}
