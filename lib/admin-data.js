import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

let schemaPromise;

export async function ensureAdminSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS spmb_applications (
          user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
          registration_no VARCHAR(32) NULL,
          nisn VARCHAR(20) NULL,
          major VARCHAR(100) NULL,
          phone VARCHAR(30) NULL,
          national_id VARCHAR(32) NULL,
          birth_place VARCHAR(100) NULL,
          birth_date DATE NULL,
          gender VARCHAR(30) NULL,
          religion VARCHAR(40) NULL,
          guardian_name VARCHAR(120) NULL,
          guardian_phone VARCHAR(30) NULL,
          address TEXT NULL,
          payment_status VARCHAR(30) NOT NULL DEFAULT 'Belum diisi',
          verification_status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Verifikasi',
          selection_status VARCHAR(30) NOT NULL DEFAULT 'Dalam Proses',
          exam_status VARCHAR(30) NOT NULL DEFAULT 'Belum Mengikuti Tes',
          exam_score DECIMAL(5,2) NULL,
          final_score DECIMAL(5,2) NULL,
          documents_json TEXT NULL,
          verification_note TEXT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_spmb_applications_verification (verification_status),
          INDEX idx_spmb_applications_selection (selection_status),
          INDEX idx_spmb_applications_major (major)
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS spmb_tpa_settings (
          id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
          test_name VARCHAR(150) NOT NULL,
          question_count SMALLINT UNSIGNED NOT NULL DEFAULT 50,
          duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
          is_active TINYINT(1) NOT NULL DEFAULT 0,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS spmb_tpa_questions (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          question_text TEXT NOT NULL,
          category VARCHAR(50) NOT NULL,
          option_a TEXT NOT NULL,
          option_b TEXT NOT NULL,
          option_c TEXT NOT NULL,
          option_d TEXT NOT NULL,
          option_e TEXT NOT NULL,
          correct_answer CHAR(1) NOT NULL,
          weight SMALLINT UNSIGNED NOT NULL DEFAULT 2,
          status VARCHAR(20) NOT NULL DEFAULT 'Draft',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_spmb_tpa_questions_status (status),
          INDEX idx_spmb_tpa_questions_category (category)
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS spmb_admin_history (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL,
          admin_id BIGINT UNSIGNED NOT NULL,
          action VARCHAR(50) NOT NULL,
          note TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_spmb_admin_history_user (user_id, created_at)
        )
      `);
      await pool.query(`
        INSERT IGNORE INTO spmb_tpa_settings (id, test_name)
        VALUES (1, 'Tes Potensi Akademik SPMB')
      `);
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }

  await schemaPromise;
  await pool.query(`
    INSERT IGNORE INTO spmb_applications (user_id)
    SELECT id FROM users WHERE role = 'calon_siswa'
  `);
}

export async function requireAdminApi() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("spmb_session")?.value);

  if (
    !session ||
    typeof session.sub !== "string" ||
    session.role !== "admin"
  ) {
    return null;
  }

  return session;
}

export function sendApiError(error, label) {
  console.error(`${label}:`, error);
  return Response.json(
    { message: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

export function parseDocuments(value) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}
