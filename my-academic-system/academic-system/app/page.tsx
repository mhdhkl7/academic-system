import { prisma } from "@/lib/prisma";
import TaskCard from "@/components/TaskCard";
import { Layout } from "lucide-react";

function getTodayDayID() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayDay = getTodayDayID();
  
  // Waktu Mulai & Akhir Hari Ini (Untuk filter log)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // LOGIC BARU: Ambil Matkul + Log Hari Ini
  const todaysMissions = await prisma.course.findMany({
    where: { day: todayDay },
    include: {
      logs: {
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: "DONE"
        }
      }
    }
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-mono">
      <header className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          ZERO-BRAIN SYSTEM
        </h1>
        <p className="text-slate-400 mt-2">
          Selamat datang, Haikal. Fokus pada satu hal hari ini.
        </p>
      </header>

      <section className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            MISI HARI INI
          </h2>
          <span className="text-sm text-slate-500">
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {todaysMissions.length > 0 ? (
          <div className="grid gap-4">
            {todaysMissions.map((mission) => (
              <TaskCard 
                key={mission.id}
                id={mission.id}
                name={mission.name}
                type={mission.type}
                sks={mission.sks}
                // LOGIC BARU: Cek apakah logs ada isinya?
                isCompleted={mission.logs.length > 0} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
            <Layout className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <h3 className="text-xl font-medium text-slate-300">Tidak ada misi aktif.</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Hari ini jadwalmu kosong.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}