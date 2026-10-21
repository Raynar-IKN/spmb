import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Dashboard Calon Siswa | SPMB",
};

export default async function CalonSiswaDashboardPage() {
  const session = await requireRole("calon_siswa");

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard Calon Siswa</h1>
      <p>Selamat datang, {session.nama}.</p>
      <p>Halaman calon siswa sedang dalam pengembangan.</p>
    </main>
  );
}
