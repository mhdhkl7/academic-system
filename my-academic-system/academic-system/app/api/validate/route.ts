import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import database

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Tangkap courseId juga dari Frontend
    const { username, courseId } = await req.json();

    // 1. Cek GitHub (Logika yang tadi sudah benar)
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`https://api.github.com/users/${username}/events?per_page=15`, {
      headers: { "User-Agent": "Academic-System-MVP", "Accept": "application/vnd.github.v3+json" },
      next: { revalidate: 0 }
    });

    if (!response.ok) return NextResponse.json({ error: "GitHub 404" }, { status: 404 });
    const events = await response.json();

    const hasPushToday = events.some((event: any) => {
      // CreateEvent & PushEvent diterima
      if (event.type !== "PushEvent" && event.type !== "CreateEvent") return false;
      const eventDate = event.created_at.split("T")[0];
      return eventDate === today;
    });

    if (!hasPushToday) {
      return NextResponse.json({ valid: false, message: "Belum ada commit hari ini." });
    }

    // 2. LOGIC BARU: Simpan ke Database (Auto-Save)
    // Cek dulu biar gak double input di hari yang sama
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        courseId: courseId,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Mulai hari ini 00:00
          lt: new Date(new Date().setHours(23, 59, 59, 999)) // Sampai 23:59
        }
      }
    });

    if (!existingLog) {
      await prisma.dailyLog.create({
        data: {
          courseId: courseId,
          taskDetail: "Validasi Otomatis via GitHub",
          status: "DONE",
          proofLink: `github.com/${username}`
        }
      });
      console.log("✅ LOG DISIMPAN KE DATABASE!");
    } else {
      console.log("ℹ️ Log sudah ada, skip save.");
    }

    return NextResponse.json({ valid: true, message: "Tersimpan di Database! 🔥" });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}