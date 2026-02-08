"use client";

import { useState } from "react";
import { BookOpen, Code, Calculator, Layout, CheckCircle, XCircle, Loader2 } from "lucide-react";

// Update Interface: Tambah isCompleted
interface TaskProps {
  id: string;
  name: string;
  type: string;
  sks: number;
  isCompleted: boolean; // <--- INI PROPS BARU
}

export default function TaskCard({ id, name, type, sks, isCompleted }: TaskProps) {
  // LOGIC BARU: Cek isCompleted saat pertama kali loading
  // Kalau true, status langsung VALID (Hijau)
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "VALID" | "INVALID">(
    isCompleted ? "VALID" : "IDLE"
  );

  const [message, setMessage] = useState(
    isCompleted ? "Misi selesai! Streak aman. 🔥" : ""
  );

  const GITHUB_USERNAME = "mhdhkl7"; // Username kamu

  const handleCheck = async () => {
    // Jangan cek lagi kalau sudah valid
    if (status === "VALID") return;

    setStatus("LOADING");
    setMessage("");

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({
          username: GITHUB_USERNAME,
          courseId: id // Kirim ID buat save ke DB
        }),
      });

      const data = await res.json();

      if (data.valid) {
        setStatus("VALID");
        setMessage(data.message || "Streak diamankan! 🔥");
      } else {
        setStatus("INVALID");
        setMessage(data.message || "Belum ada commit hari ini.");
      }
    } catch (error) {
      setStatus("INVALID");
      setMessage("Error koneksi server.");
    }
  };

  // Helper Icon
  const getIcon = (t: string) => {
    switch (t) {
      case "HITUNG": return <Calculator className="w-6 h-6 text-blue-400" />;
      case "PRAKTEK": return <Code className="w-6 h-6 text-green-400" />;
      case "KONSEP": return <BookOpen className="w-6 h-6 text-yellow-400" />;
      default: return <Layout className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className={`group relative bg-slate-900 border rounded-xl p-6 transition-all ${
      status === "VALID" ? "border-green-500/50 bg-green-900/10" : "border-slate-800 hover:border-blue-500/50"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
            {getIcon(type)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-semibold">
                {type}
              </span>
              <span>{sks > 0 ? `${sks} SKS` : "Self-Dev"}</span>
            </div>
          </div>
        </div>

        {/* Tombol Interaktif */}
        <button
          onClick={handleCheck}
          disabled={status === "LOADING" || status === "VALID"}
          className={`p-2 rounded-full transition-all ${
            status === "VALID"
              ? "text-green-400 bg-green-500/20 cursor-default"
              : "text-slate-600 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {status === "LOADING" ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          ) : status === "VALID" ? (
            <CheckCircle className="w-6 h-6" />
          ) : status === "INVALID" ? (
            <XCircle className="w-6 h-6 text-red-500" />
          ) : (
            <CheckCircle className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Instruksi & Pesan Status */}
      <div className="mt-4 pl-[4.5rem] text-sm">
        {status === "IDLE" && (
          <p className="text-slate-400 italic border-l-2 border-slate-700 pl-4 py-1">
            "{type === 'HITUNG' ? "Kerjakan 2 soal latihan." : "Push kode ke GitHub."}"
          </p>
        )}

        {/* Pesan Validasi */}
        {message && (
          <p className={`font-semibold ${status === "VALID" ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}