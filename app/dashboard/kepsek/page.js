import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Dashboard Kepala Sekolah | SPMB",
};

export default async function KepsekDashboardPage() {
  const session = await requireRole("kepsek");

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard Kepala Sekolah</h1>
      <p>Selamat datang, {session.nama}.</p>
      <p>Halaman kepala sekolah sedang dalam pengembangan.</p>
    </main>
  );
}
