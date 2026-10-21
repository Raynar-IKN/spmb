import pool from "@/lib/db";
import {
  ensureAdminSchema,
  parseDocuments,
  requireAdminApi,
  sendApiError,
} from "@/lib/admin-data";

const profileFields = [
  ["registration_no", "registrationNo"],
  ["nisn", "nisn"],
  ["major", "major"],
  ["phone", "phone"],
  ["national_id", "nationalId"],
  ["birth_place", "birthPlace"],
  ["birth_date", "birthDate"],
  ["gender", "gender"],
  ["religion", "religion"],
  ["guardian_name", "guardianName"],
  ["guardian_phone", "guardianPhone"],
  ["address", "address"],
  ["payment_status", "paymentStatus"],
];
const questionCategories = ["Numerik", "Verbal", "Logika", "Analogi"];

function responseError(message, status = 400) {
  return Response.json({ message }, { status });
}

async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function validDate(value) {
  if (value === null || value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned && cleaned.length <= maxLength ? cleaned : null;
}

function userId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function serializeQuestion(row) {
  return {
    id: String(row.id),
    questionText: row.question_text,
    category: row.category,
    options: {
      A: row.option_a,
      B: row.option_b,
      C: row.option_c,
      D: row.option_d,
      E: row.option_e,
    },
    correctAnswer: row.correct_answer,
    weight: Number(row.weight),
    status: row.status,
  };
}

export async function GET(request) {
  const session = await requireAdminApi();
  if (!session) return responseError("Akses admin diperlukan.", 401);

  try {
    await ensureAdminSchema();
    const view = new URL(request.url).searchParams.get("view");

    if (view === "questions") {
      const [questions] = await pool.execute(
        `SELECT id, question_text, category, option_a, option_b, option_c,
                option_d, option_e, correct_answer, weight, status
         FROM spmb_tpa_questions
         ORDER BY id DESC`
      );
      const [[settings]] = await pool.execute(
        `SELECT test_name, question_count, duration_minutes, is_active
         FROM spmb_tpa_settings WHERE id = 1`
      );
      return Response.json({
        questions: questions.map(serializeQuestion),
        settings: {
          name: settings.test_name,
          questionCount: Number(settings.question_count),
          duration: Number(settings.duration_minutes),
          active: Boolean(settings.is_active),
        },
      });
    }

    if (view !== "applicants" && view !== "reports") {
      return responseError("Modul tidak ditemukan.", 404);
    }

    const [userColumns] = await pool.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      ["users"]
    );
    const hasCreatedAt = userColumns.some(
      (column) => column.COLUMN_NAME.toLowerCase() === "created_at"
    );
    const createdAtColumn = hasCreatedAt
      ? "u.created_at AS account_created_at"
      : "NULL AS account_created_at";
    const [rows] = await pool.execute(
      `SELECT u.id, u.nama, u.email, ${createdAtColumn},
              a.registration_no, a.nisn, a.major, a.phone, a.national_id,
              a.birth_place, a.birth_date, a.gender, a.religion,
              a.guardian_name, a.guardian_phone, a.address,
              a.payment_status, a.verification_status, a.selection_status,
              a.exam_status, a.exam_score, a.final_score, a.documents_json,
              a.verification_note
       FROM users u
       LEFT JOIN spmb_applications a ON a.user_id = u.id
       WHERE u.role = 'calon_siswa'
       ORDER BY u.id DESC`
    );
    const applicants = rows.map((row) => ({
      id: String(row.id),
      name: row.nama,
      email: row.email,
      createdAt: row.account_created_at
        ? new Date(row.account_created_at).toISOString()
        : null,
      registrationNo: row.registration_no,
      nisn: row.nisn,
      major: row.major,
      phone: row.phone,
      nationalId: row.national_id,
      birthPlace: row.birth_place,
      birthDate: row.birth_date,
      gender: row.gender,
      religion: row.religion,
      guardianName: row.guardian_name,
      guardianPhone: row.guardian_phone,
      address: row.address,
      paymentStatus: row.payment_status,
      verificationStatus: row.verification_status,
      selectionStatus: row.selection_status,
      examStatus: row.exam_status,
      examScore: row.exam_score === null ? null : Number(row.exam_score),
      finalScore: row.final_score === null ? null : Number(row.final_score),
      documents: parseDocuments(row.documents_json),
      verificationNote: row.verification_note,
    }));

    if (view === "reports") {
      const totals = {
        applicants: applicants.length,
        verified: applicants.filter(
          (applicant) => applicant.verificationStatus === "Terverifikasi"
        ).length,
        accepted: applicants.filter(
          (applicant) => applicant.selectionStatus === "Lolos"
        ).length,
        waiting: applicants.filter(
          (applicant) =>
            applicant.verificationStatus !== "Terverifikasi" ||
            applicant.selectionStatus === "Dalam Proses"
        ).length,
      };
      return Response.json({ applicants, totals });
    }

    const [history] = await pool.execute(
      `SELECT h.user_id, h.action, h.note, h.created_at, u.nama AS admin_name
       FROM spmb_admin_history h
       LEFT JOIN users u ON u.id = h.admin_id
       ORDER BY h.created_at DESC
       LIMIT 200`
    );
    return Response.json({
      applicants,
      history: history.map((row) => ({
        userId: String(row.user_id),
        action: row.action,
        note: row.note,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : null,
        adminName: row.admin_name,
      })),
    });
  } catch (error) {
    return sendApiError(error, "Admin data request failed");
  }
}

export async function POST(request) {
  const session = await requireAdminApi();
  if (!session) return responseError("Akses admin diperlukan.", 401);

  try {
    await ensureAdminSchema();
    const body = await request.json();

    if (body.action !== "create-question") {
      return responseError("Aksi tidak dikenal.", 400);
    }

    const questionText = cleanText(body.questionText, 4000);
    const category = cleanText(body.category, 50);
    const correctAnswer = cleanText(body.correctAnswer, 1)?.toUpperCase();
    const weight = Number(body.weight);
    const options = body.options;

    if (
      !questionText ||
      !questionCategories.includes(category) ||
      !["A", "B", "C", "D", "E"].includes(correctAnswer) ||
      !Number.isInteger(weight) ||
      weight < 1 ||
      weight > 100 ||
      !options ||
      ["A", "B", "C", "D", "E"].some(
        (key) => !cleanText(options[key], 500)
      )
    ) {
      return responseError("Lengkapi soal, kategori, opsi jawaban, dan kunci.");
    }

    const [result] = await pool.execute(
      `INSERT INTO spmb_tpa_questions
        (question_text, category, option_a, option_b, option_c, option_d,
         option_e, correct_answer, weight, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionText,
        category,
        ...["A", "B", "C", "D", "E"].map((key) =>
          cleanText(options[key], 500)
        ),
        correctAnswer,
        weight,
        body.status === "Aktif" ? "Aktif" : "Draft",
      ]
    );
    return Response.json({ id: String(result.insertId) }, { status: 201 });
  } catch (error) {
    return sendApiError(error, "Create TPA question failed");
  }
}

export async function PATCH(request) {
  const session = await requireAdminApi();
  if (!session) return responseError("Akses admin diperlukan.", 401);

  try {
    await ensureAdminSchema();
    const body = await request.json();
    const id = userId(body.id);

    if (!id) return responseError("ID calon siswa tidak valid.");

    if (body.action === "update-profile") {
      const values = profileFields.map(([field, key]) => {
        if (body[key] === null || body[key] === "") return null;
        return cleanText(body[key], field === "address" ? 2000 : 150);
      });
      if (
        profileFields.some(
          ([, key], index) =>
            body[key] !== null &&
            body[key] !== "" &&
            values[index] === null
        )
      ) {
        return responseError("Data profil melebihi batas panjang yang diizinkan.");
      }
      if (!validDate(body.birthDate)) {
        return responseError("Tanggal lahir tidak valid.");
      }
      await pool.execute(
        `INSERT INTO spmb_applications (user_id, ${profileFields.map(([field]) => field).join(", ")})
         VALUES (?, ${profileFields.map(() => "?").join(", ")})
         ON DUPLICATE KEY UPDATE ${profileFields
           .map(([field]) => `${field} = VALUES(${field})`)
           .join(", ")}`,
        [id, ...values]
      );
      return Response.json({ message: "Data calon siswa tersimpan." });
    }

    if (body.action === "update-settings") {
      const name = cleanText(body.name, 150);
      const questionCount = Number(body.questionCount);
      const duration = Number(body.duration);
      if (
        !name ||
        !Number.isInteger(questionCount) ||
        questionCount < 1 ||
        questionCount > 500 ||
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 600 ||
        typeof body.active !== "boolean"
      ) {
        return responseError("Pengaturan tes tidak valid.");
      }
      await pool.execute(
        `UPDATE spmb_tpa_settings
         SET test_name = ?, question_count = ?, duration_minutes = ?, is_active = ?
         WHERE id = 1`,
        [name, questionCount, duration, body.active ? 1 : 0]
      );
      return Response.json({ message: "Pengaturan tes tersimpan." });
    }

    if (body.action === "update-question") {
      const questionId = userId(body.questionId);
      const status = body.status;
      if (!questionId || !["Aktif", "Draft"].includes(status)) {
        return responseError("Status soal tidak valid.");
      }
      const [result] = await pool.execute(
        "UPDATE spmb_tpa_questions SET status = ? WHERE id = ?",
        [status, questionId]
      );
      if (result.affectedRows === 0) {
        return responseError("Soal tidak ditemukan.", 404);
      }
      return Response.json({ message: "Status soal diperbarui." });
    }

    if (body.action === "verify-applicant") {
      const status = body.status;
      const note = typeof body.note === "string" ? body.note.trim() : "";
      if (
        !["Terverifikasi", "Perlu Perbaikan"].includes(status) ||
        note.length > 2000
      ) {
        return responseError("Keputusan verifikasi atau catatan tidak valid.");
      }
      const [[applicant]] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'calon_siswa'",
        [id]
      );
      if (!applicant) return responseError("Calon siswa tidak ditemukan.", 404);

      await withTransaction(async (connection) => {
        await connection.execute(
          `UPDATE spmb_applications
           SET verification_status = ?, verification_note = ?
           WHERE user_id = ?`,
          [status, note || null, id]
        );
        await connection.execute(
          `INSERT INTO spmb_admin_history (user_id, admin_id, action, note)
           VALUES (?, ?, ?, ?)`,
          [id, Number(session.sub), status, note || null]
        );
      });
      return Response.json({ message: "Keputusan verifikasi tersimpan." });
    }

    if (body.action === "update-documents") {
      const allowedDocuments = [
        "familyCard",
        "birthCertificate",
        "schoolCertificate",
        "photo",
        "healthCertificate",
        "paymentProof",
      ];
      if (
        !body.documents ||
        typeof body.documents !== "object" ||
        Array.isArray(body.documents) ||
        allowedDocuments.some(
          (key) => typeof body.documents[key] !== "boolean"
        )
      ) {
        return responseError("Status checklist dokumen tidak valid.");
      }
      const [[applicant]] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'calon_siswa'",
        [id]
      );
      if (!applicant) return responseError("Calon siswa tidak ditemukan.", 404);
      await withTransaction(async (connection) => {
        await connection.execute(
          "UPDATE spmb_applications SET documents_json = ? WHERE user_id = ?",
          [JSON.stringify(body.documents), id]
        );
        await connection.execute(
          `INSERT INTO spmb_admin_history (user_id, admin_id, action, note)
           VALUES (?, ?, ?, ?)`,
          [id, Number(session.sub), "Checklist dokumen diperbarui", null]
        );
      });
      return Response.json({ message: "Checklist dokumen tersimpan." });
    }

    if (body.action === "decide-selection") {
      const status = body.status;
      const examScore =
        body.examScore === "" || body.examScore === null
          ? null
          : Number(body.examScore);
      const finalScore =
        body.finalScore === "" || body.finalScore === null
          ? null
          : Number(body.finalScore);
      const note = typeof body.note === "string" ? body.note.trim() : "";
      if (
        !["Lolos", "Tidak Lolos", "Dalam Proses"].includes(status) ||
        (examScore !== null &&
          (!Number.isFinite(examScore) || examScore < 0 || examScore > 100)) ||
        (finalScore !== null &&
          (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > 100)) ||
        note.length > 2000
      ) {
        return responseError("Hasil seleksi tidak valid.");
      }
      const [[applicant]] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'calon_siswa'",
        [id]
      );
      if (!applicant) return responseError("Calon siswa tidak ditemukan.", 404);

      await withTransaction(async (connection) => {
        await connection.execute(
          `UPDATE spmb_applications
           SET selection_status = ?, exam_score = ?, final_score = ?
           WHERE user_id = ?`,
          [status, examScore, finalScore, id]
        );
        await connection.execute(
          `INSERT INTO spmb_admin_history (user_id, admin_id, action, note)
           VALUES (?, ?, ?, ?)`,
          [id, Number(session.sub), `Seleksi: ${status}`, note || null]
        );
      });
      return Response.json({ message: "Hasil seleksi tersimpan." });
    }

    return responseError("Aksi tidak dikenal.");
  } catch (error) {
    return sendApiError(error, "Update admin data failed");
  }
}

export async function DELETE(request) {
  const session = await requireAdminApi();
  if (!session) return responseError("Akses admin diperlukan.", 401);

  try {
    await ensureAdminSchema();
    const questionId = userId(new URL(request.url).searchParams.get("id"));
    if (!questionId) return responseError("ID soal tidak valid.");
    const [result] = await pool.execute(
      "DELETE FROM spmb_tpa_questions WHERE id = ?",
      [questionId]
    );
    if (result.affectedRows === 0) {
      return responseError("Soal tidak ditemukan.", 404);
    }
    return Response.json({ message: "Soal dihapus." });
  } catch (error) {
    return sendApiError(error, "Delete TPA question failed");
  }
}
