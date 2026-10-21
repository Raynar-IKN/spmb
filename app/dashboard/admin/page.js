import { requireRole } from "@/lib/auth";
import pool from "@/lib/db";
import { ensureAdminSchema } from "@/lib/admin-data";
import AdminDashboard from "./dashboard-client";

export const metadata = {
  title: "Dashboard Admin | SPMB",
};

function toIsoString(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default async function AdminDashboardPage() {
  const session = await requireRole("admin");
  await ensureAdminSchema();
  const [[countRows], [columnRows], [selectionRows], [majorRows]] = await Promise.all([
    pool.execute(
      "SELECT COUNT(*) AS total FROM users WHERE role = ?",
      ["calon_siswa"]
    ),
    pool.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      ["users"]
    ),
    pool.execute(
      `SELECT selection_status, COUNT(*) AS total
       FROM spmb_applications
       GROUP BY selection_status`
    ),
    pool.execute(
      `SELECT major, COUNT(*) AS total
       FROM spmb_applications
       WHERE major IS NOT NULL AND major <> ''
       GROUP BY major
       ORDER BY total DESC, major ASC
       LIMIT 6`
    ),
  ]);
  const hasCreatedAt = columnRows.some(
    (column) => column.COLUMN_NAME.toLowerCase() === "created_at"
  );
  const createdAtColumn = hasCreatedAt ? ", created_at" : "";
  const [studentRows] = await pool.execute(
    `SELECT id, nama, email${createdAtColumn}
     FROM users
     WHERE role = ?
     ORDER BY id DESC
     LIMIT 100`,
    ["calon_siswa"]
  );

  let trendRows = [];
  let currentMonth = null;

  if (hasCreatedAt) {
    const [[monthlyRows], [calendarRows]] = await Promise.all([
      pool.execute(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total
         FROM users
         WHERE role = ?
           AND created_at >= DATE_SUB(
             DATE_FORMAT(CURDATE(), '%Y-%m-01'),
             INTERVAL 11 MONTH
           )
         GROUP BY month
         ORDER BY month ASC`,
        ["calon_siswa"]
      ),
      pool.execute(
        "SELECT DATE_FORMAT(CURDATE(), '%Y-%m') AS currentMonth"
      ),
    ]);

    trendRows = monthlyRows.map((row) => ({
      month: row.month,
      total: Number(row.total),
    }));
    currentMonth = calendarRows[0]?.currentMonth ?? null;
  }

  const applicants = studentRows.map((student) => ({
    id: String(student.id),
    nama: student.nama,
    email: student.email,
    createdAt: hasCreatedAt ? toIsoString(student.created_at) : null,
  }));
  const selectionTotals = {
    accepted: 0,
    rejected: 0,
    inProgress: 0,
  };
  for (const row of selectionRows) {
    if (row.selection_status === "Lolos") selectionTotals.accepted = Number(row.total);
    if (row.selection_status === "Tidak Lolos") selectionTotals.rejected = Number(row.total);
    if (row.selection_status === "Dalam Proses") selectionTotals.inProgress = Number(row.total);
  }

  return (
    <AdminDashboard
      adminName={session.nama}
      applicants={applicants}
      totalApplicants={Number(countRows[0]?.total ?? 0)}
      selectionTotals={selectionTotals}
      majorTotals={majorRows.map((row) => ({
        major: row.major,
        total: Number(row.total),
      }))}
      trendRows={trendRows}
      currentMonth={currentMonth}
      hasRegistrationDates={hasCreatedAt}
    />
  );
}
