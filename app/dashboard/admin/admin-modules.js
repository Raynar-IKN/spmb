"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./dashboard.module.css";

const documentFields = [
  ["familyCard", "Kartu Keluarga"],
  ["birthCertificate", "Akta Kelahiran"],
  ["schoolCertificate", "Ijazah / Surat Keterangan Lulus"],
  ["photo", "Pas Foto"],
  ["healthCertificate", "Surat Keterangan Sehat"],
  ["paymentProof", "Bukti Pembayaran"],
];

const profileFields = [
  ["registrationNo", "Nomor pendaftaran"],
  ["nisn", "NISN"],
  ["major", "Jurusan pilihan"],
  ["phone", "Nomor telepon"],
  ["nationalId", "NIK"],
  ["birthPlace", "Tempat lahir"],
  ["birthDate", "Tanggal lahir"],
  ["gender", "Jenis kelamin"],
  ["religion", "Agama"],
  ["guardianName", "Nama orang tua/wali"],
  ["guardianPhone", "Telepon orang tua/wali"],
  ["address", "Alamat lengkap"],
  ["paymentStatus", "Status pembayaran"],
];

const blankQuestion = {
  questionText: "",
  category: "Numerik",
  options: { A: "", B: "", C: "", D: "", E: "" },
  correctAnswer: "A",
  weight: 2,
  status: "Draft",
};

async function requestAdmin(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Permintaan tidak dapat diproses.");
  }
  return result;
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function display(value) {
  return value === null || value === undefined || value === ""
    ? "Belum diisi"
    : value;
}

function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeZone: "Asia/Jakarta",
      }).format(date);
}

function Status({ children }) {
  const tone =
    children === "Terverifikasi" || children === "Lolos" || children === "Aktif"
      ? "success"
      : children === "Perlu Perbaikan" || children === "Tidak Lolos"
        ? "danger"
        : "waiting";
  return <span className={`${styles.moduleStatus} ${styles[tone]}`}>{children}</span>;
}

function ModuleMessage({ error, notice }) {
  if (error) return <p className={styles.moduleError} role="alert">{error}</p>;
  if (notice) return <p className={styles.moduleNotice} role="status">{notice}</p>;
  return null;
}

function ApplicantForm({ applicant, onClose, onSaved }) {
  const [form, setForm] = useState(() => Object.fromEntries(profileFields.map(([key]) => {
    const value = applicant[key] ?? "";
    return [key, key === "birthDate" && value ? String(value).slice(0, 10) : value];
  })));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await requestAdmin("/api/admin", {
        method: "PATCH",
        body: JSON.stringify({ action: "update-profile", id: applicant.id, ...form }),
      });
      onSaved();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className={styles.moduleModal} role="dialog" aria-modal="true" aria-labelledby="edit-applicant-title">
        <div className={styles.moduleTitleRow}>
          <div>
            <span className={styles.moduleEyebrow}>PROFIL PENDAFTAR</span>
            <h2 id="edit-applicant-title">Data {applicant.name}</h2>
          </div>
          <button className={styles.iconButton} onClick={onClose} type="button" aria-label="Tutup">×</button>
        </div>
        <form onSubmit={save}>
          <div className={styles.formGrid}>
            {profileFields.map(([key, label]) => (
              <label className={key === "address" ? styles.formWide : ""} key={key}>
                <span>{label}</span>
                {key === "address" ? (
                  <textarea rows={3} value={form[key]} onChange={(event) => update(key, event.target.value)} />
                ) : key === "gender" || key === "paymentStatus" ? (
                  <select value={form[key]} onChange={(event) => update(key, event.target.value)}>
                    <option value="">Belum diisi</option>
                    {(key === "gender"
                      ? ["Laki-laki", "Perempuan"]
                      : ["Belum diisi", "Belum Bayar", "Menunggu Konfirmasi", "Lunas"]
                    ).map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                ) : (
                  <input
                    type={key === "birthDate" ? "date" : "text"}
                    value={form[key]}
                    onChange={(event) => update(key, event.target.value)}
                    maxLength={key === "address" ? 2000 : 150}
                  />
                )}
              </label>
            ))}
          </div>
          <ModuleMessage error={error} />
          <div className={styles.moduleActions}>
            <button className={styles.secondaryButton} type="button" onClick={onClose}>Batal</button>
            <button className={styles.primaryButton} type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ApplicantTable({ applicants, onEdit, onVerify, isVerify = false }) {
  return (
    <div className={styles.moduleTableScroll}>
      <table className={styles.moduleTable}>
        <thead><tr>
          <th>Calon siswa</th><th>No. pendaftaran</th><th>Jurusan</th>
          <th>Pembayaran</th><th>Verifikasi</th><th>Aksi</th>
        </tr></thead>
        <tbody>
          {applicants.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={styles.moduleStudent}>
                  <span className={styles.moduleAvatar}>{initials(item.name)}</span>
                  <span><strong>{item.name}</strong><small>{item.email}</small></span>
                </span>
              </td>
              <td>{display(item.registrationNo)}</td>
              <td>{display(item.major)}</td>
              <td><Status>{item.paymentStatus || "Belum diisi"}</Status></td>
              <td><Status>{item.verificationStatus || "Menunggu Verifikasi"}</Status></td>
              <td>
                <div className={styles.tableActions}>
                  {isVerify && (
                    <button className={styles.primarySmallButton} type="button" onClick={() => onVerify(item)}>
                      Verifikasi Sekarang
                    </button>
                  )}
                  {!isVerify && (
                    <button className={styles.secondarySmallButton} type="button" onClick={() => onEdit(item)}>
                      Lihat / Ubah
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {applicants.length === 0 && (
            <tr><td className={styles.moduleEmpty} colSpan={6}>Tidak ada data calon siswa yang sesuai.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function VerificationDetail({ applicant, history, onBack, onSaved, onDocumentsSaved }) {
  const [documents, setDocuments] = useState(() => Object.fromEntries(
    documentFields.map(([key]) => [key, Boolean(applicant.documents?.[key])])
  ));
  const [status, setStatus] = useState("Terverifikasi");
  const [note, setNote] = useState(applicant.verificationNote || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const actions = history.filter((entry) => entry.userId === applicant.id);

  async function saveDocuments() {
    setBusy(true);
    setError("");
    try {
      await requestAdmin("/api/admin", {
        method: "PATCH",
        body: JSON.stringify({ action: "update-documents", id: applicant.id, documents }),
      });
      onDocumentsSaved("Checklist dokumen berhasil disimpan.");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitDecision(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestAdmin("/api/admin", {
        method: "PATCH",
        body: JSON.stringify({ action: "verify-applicant", id: applicant.id, status, note }),
      });
      onSaved(`Status verifikasi ${applicant.name} berhasil diperbarui.`);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.moduleStack}>
      <button className={styles.backButton} type="button" onClick={onBack}>← Kembali ke daftar verifikasi</button>
      <div className={styles.detailGrid}>
        <div className={styles.moduleStack}>
          <section className={styles.modulePanel}>
            <div className={styles.applicantHero}>
              <span className={styles.largeAvatar}>{initials(applicant.name)}</span>
              <div><h2>{applicant.name}</h2><p>{applicant.email}</p><Status>{applicant.verificationStatus}</Status></div>
            </div>
            <div className={styles.detailFacts}>
              {[
                ["Nomor pendaftaran", applicant.registrationNo],
                ["NISN", applicant.nisn],
                ["NIK", applicant.nationalId],
                ["Jurusan", applicant.major],
                ["Telepon", applicant.phone],
                ["Tempat, tanggal lahir", [applicant.birthPlace, applicant.birthDate].filter(Boolean).join(", ")],
                ["Jenis kelamin", applicant.gender],
                ["Agama", applicant.religion],
                ["Orang tua / wali", applicant.guardianName],
                ["Telepon wali", applicant.guardianPhone],
                ["Alamat", applicant.address],
              ].map(([label, value]) => (
                <div key={label}><small>{label}</small><strong>{display(value)}</strong></div>
              ))}
            </div>
          </section>
          <section className={styles.modulePanel}>
            <div className={styles.moduleTitleRow}><div><span className={styles.moduleEyebrow}>DOKUMEN PENDAFTARAN</span><h2>Checklist Dokumen</h2></div></div>
            <div className={styles.documentList}>
              {documentFields.map(([key, label]) => (
                <label key={key} className={styles.documentItem}>
                  <input
                    type="checkbox"
                    checked={documents[key]}
                    onChange={(event) => setDocuments((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  <span>{label}</span>
                  <small>{documents[key] ? "Lengkap" : "Belum lengkap"}</small>
                </label>
              ))}
            </div>
            <ModuleMessage error={error} />
            <div className={styles.moduleActions}>
              <button className={styles.secondaryButton} type="button" disabled={busy} onClick={saveDocuments}>
                Simpan Checklist
              </button>
            </div>
          </section>
        </div>
        <aside className={styles.moduleStack}>
          <form className={styles.modulePanel} onSubmit={submitDecision}>
            <span className={styles.moduleEyebrow}>KEPUTUSAN ADMIN</span>
            <h2>Hasil Verifikasi</h2>
            <label className={styles.fieldLabel}>Keputusan
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              </select>
            </label>
            <label className={styles.fieldLabel}>Catatan untuk calon siswa
              <textarea rows={5} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tuliskan catatan atau dokumen yang perlu diperbaiki..." />
            </label>
            <ModuleMessage error={error} />
            <button className={styles.primaryButton} type="submit" disabled={busy}>
              {busy ? "Menyimpan..." : "Simpan Keputusan"}
            </button>
          </form>
          <section className={styles.modulePanel}>
            <span className={styles.moduleEyebrow}>RIWAYAT ADMIN</span><h2>Aktivitas Verifikasi</h2>
            {actions.length ? actions.map((entry, index) => (
              <div className={styles.historyItem} key={`${entry.createdAt}-${index}`}>
                <span className={styles.historyDot} />
                <div><strong>{entry.action}</strong><small>{entry.adminName || "Admin"} · {dateLabel(entry.createdAt)}</small>
                  {entry.note && <p>{entry.note}</p>}</div>
              </div>
            )) : <p className={styles.moduleHint}>Belum ada riwayat perubahan verifikasi.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function ApplicantModule({ applicants, search, refresh, notify }) {
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState(null);
  const [formApplicant, setFormApplicant] = useState(null);
  const statuses = ["Semua", "Menunggu Verifikasi", "Terverifikasi", "Perlu Perbaikan"];
  const filtered = applicants.filter((item) => {
    const matchesSearch = `${item.name} ${item.email} ${item.registrationNo || ""} ${item.nisn || ""}`
      .toLocaleLowerCase("id-ID").includes(search.trim().toLocaleLowerCase("id-ID"));
    return matchesSearch && (filter === "Semua" || item.verificationStatus === filter);
  });
  return (
    <>
      <section className={styles.modulePanel}>
        <div className={styles.moduleTitleRow}>
          <div><span className={styles.moduleEyebrow}>PENDAFTARAN</span><h2>Data Calon Siswa</h2><p>Kelola profil dan status pendaftaran calon siswa.</p></div>
          <span className={styles.moduleCount}>{filtered.length} calon siswa</span>
        </div>
        <div className={styles.moduleToolbar}>
          <label className={styles.moduleFilter}>Status verifikasi
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>
        <ApplicantTable applicants={filtered} onEdit={setFormApplicant} />
      </section>
      {formApplicant && <ApplicantForm applicant={formApplicant} onClose={() => setFormApplicant(null)} onSaved={() => {
        setFormApplicant(null); refresh(); notify("Data calon siswa tersimpan.");
      }} />}
    </>
  );
}

function VerifyModule({ applicants, history, search, refresh, notify }) {
  const [selected, setSelected] = useState(null);
  const pending = applicants.filter((item) =>
    item.verificationStatus !== "Terverifikasi" &&
    `${item.name} ${item.email} ${item.registrationNo || ""}`
      .toLocaleLowerCase("id-ID").includes(search.trim().toLocaleLowerCase("id-ID"))
  );
  const applicant = applicants.find((item) => item.id === selected);
  if (applicant) return (
    <VerificationDetail
      key={applicant.id}
      applicant={applicant}
      history={history}
      onBack={() => setSelected(null)}
      onSaved={(message) => { setSelected(null); refresh(); notify(message); }}
      onDocumentsSaved={(message) => { refresh(); notify(message); }}
    />
  );
  return (
    <section className={styles.modulePanel}>
      <div className={styles.moduleTitleRow}>
        <div><span className={styles.moduleEyebrow}>PEMERIKSAAN BERKAS</span><h2>Verifikasi Calon Siswa</h2><p>Periksa data dan dokumen sebelum menetapkan hasil verifikasi.</p></div>
        <span className={styles.moduleCount}>{pending.length} menunggu</span>
      </div>
      <ApplicantTable applicants={pending} onVerify={(item) => setSelected(item.id)} isVerify />
    </section>
  );
}

function TpaModule({ refresh, notify }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState(blankQuestion);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  async function load() {
    try {
      const result = await requestAdmin("/api/admin?view=questions");
      setData(result);
      setError("");
    } catch (failure) { setError(failure.message); }
  }
  useEffect(() => { load(); }, []);

  async function saveSettings(event) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await requestAdmin("/api/admin", { method: "PATCH", body: JSON.stringify({ action: "update-settings", ...data.settings }) });
      setNotice("Pengaturan Tes TPA berhasil disimpan."); await load(); refresh();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }

  async function createQuestion(event) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await requestAdmin("/api/admin", { method: "POST", body: JSON.stringify({ action: "create-question", ...question }) });
      setShowForm(false); setQuestion(blankQuestion); setNotice("Soal baru berhasil ditambahkan."); await load();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }

  async function updateQuestion(item) {
    setBusyId(item.id); setError("");
    try {
      await requestAdmin("/api/admin", { method: "PATCH", body: JSON.stringify({
        action: "update-question", questionId: item.id, status: item.status === "Aktif" ? "Draft" : "Aktif",
      }) });
      await load();
    } catch (failure) { setError(failure.message); }
    finally { setBusyId(""); }
  }

  async function deleteQuestion(item) {
    if (!window.confirm("Yakin ingin menghapus soal ini?")) return;
    setBusyId(item.id); setError("");
    try {
      await requestAdmin(`/api/admin?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      setNotice("Soal berhasil dihapus."); await load();
    } catch (failure) { setError(failure.message); }
    finally { setBusyId(""); }
  }

  const questions = data?.questions || [];
  const filtered = filter === "Semua" ? questions : questions.filter((item) => item.category === filter || item.status === filter);
  const activeCount = questions.filter((item) => item.status === "Aktif").length;
  const categoryCounts = ["Numerik", "Verbal", "Logika", "Analogi"].map((category) => ({
    category,
    count: questions.filter((item) => item.category === category).length,
  }));
  return (
    <div className={styles.moduleStack}>
      <ModuleMessage error={error} notice={notice} />
      <section className={styles.modulePanel}>
        <div className={styles.moduleTitleRow}><div><span className={styles.moduleEyebrow}>KONFIGURASI UJIAN</span><h2>Tes Potensi Akademik</h2><p>Atur jadwal ujian dan kelola bank soal calon siswa.</p></div>
          <Status>{data?.settings.active ? "Aktif" : "Draft"}</Status></div>
        {data && <form className={styles.settingsGrid} onSubmit={saveSettings}>
          <label className={styles.fieldLabel}>Nama tes<input value={data.settings.name} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, name: event.target.value } }))} maxLength={150} required /></label>
          <label className={styles.fieldLabel}>Jumlah soal<input type="number" min="1" max="500" value={data.settings.questionCount} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, questionCount: Number(event.target.value) } }))} /></label>
          <label className={styles.fieldLabel}>Durasi (menit)<input type="number" min="1" max="600" value={data.settings.duration} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, duration: Number(event.target.value) } }))} /></label>
          <label className={styles.toggleField}><input type="checkbox" checked={data.settings.active} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, active: event.target.checked } }))} /><span>Aktifkan tes untuk peserta</span></label>
          <button className={styles.primaryButton} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</button>
        </form>}
      </section>
      <section className={styles.modulePanel}>
        <div className={styles.moduleTitleRow}><div><span className={styles.moduleEyebrow}>BANK SOAL</span><h2>Daftar Soal TPA</h2><p>{activeCount} soal aktif dari {questions.length} soal tersimpan.</p></div>
          <button className={styles.primaryButton} type="button" onClick={() => setShowForm(true)}>+ Tambah Soal</button></div>
        <div className={styles.categoryGrid}>
          {categoryCounts.map(({ category, count }) => (
            <div className={styles.categoryCard} key={category}>
              <div><span>{category}</span><strong>{count}</strong></div>
              <div className={styles.categoryTrack}><span style={{ width: `${questions.length ? (count / questions.length) * 100 : 0}%` }} /></div>
            </div>
          ))}
        </div>
        <div className={styles.moduleToolbar}><label className={styles.moduleFilter}>Filter soal
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            {["Semua", "Numerik", "Verbal", "Logika", "Analogi", "Aktif", "Draft"].map((value) => <option key={value}>{value}</option>)}
          </select></label></div>
        <div className={styles.moduleTableScroll}><table className={styles.moduleTable}>
          <thead><tr><th>Soal</th><th>Kategori</th><th>Kunci</th><th>Bobot</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{filtered.map((item) => <tr key={item.id}>
            <td className={styles.questionText}>{item.questionText}</td><td>{item.category}</td><td>{item.correctAnswer}</td><td>{item.weight}</td><td><Status>{item.status}</Status></td>
            <td><div className={styles.tableActions}><button type="button" className={styles.secondarySmallButton} disabled={busyId === item.id} onClick={() => updateQuestion(item)}>{item.status === "Aktif" ? "Jadikan Draft" : "Aktifkan"}</button><button type="button" className={styles.dangerSmallButton} disabled={busyId === item.id} onClick={() => deleteQuestion(item)}>Hapus</button></div></td>
          </tr>)}{!filtered.length && <tr><td colSpan={6} className={styles.moduleEmpty}>Belum ada soal untuk filter ini.</td></tr>}</tbody>
        </table></div>
      </section>
      {showForm && <div className={styles.modalBackdrop} role="presentation"><section className={`${styles.moduleModal} ${styles.questionModal}`} role="dialog" aria-modal="true" aria-labelledby="new-question-title">
        <div className={styles.moduleTitleRow}><div><span className={styles.moduleEyebrow}>BANK SOAL</span><h2 id="new-question-title">Tambah Soal TPA</h2></div><button className={styles.iconButton} type="button" onClick={() => setShowForm(false)} aria-label="Tutup">×</button></div>
        <form onSubmit={createQuestion}>
          <label className={styles.fieldLabel}>Pertanyaan<textarea rows={3} maxLength={4000} value={question.questionText} onChange={(event) => setQuestion((current) => ({ ...current, questionText: event.target.value }))} required /></label>
          <div className={styles.settingsGrid}><label className={styles.fieldLabel}>Kategori<select value={question.category} onChange={(event) => setQuestion((current) => ({ ...current, category: event.target.value }))}>{["Numerik", "Verbal", "Logika", "Analogi"].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className={styles.fieldLabel}>Bobot<input type="number" min="1" max="100" value={question.weight} onChange={(event) => setQuestion((current) => ({ ...current, weight: Number(event.target.value) }))} /></label>
            <label className={styles.fieldLabel}>Kunci jawaban<select value={question.correctAnswer} onChange={(event) => setQuestion((current) => ({ ...current, correctAnswer: event.target.value }))}>{["A", "B", "C", "D", "E"].map((value) => <option key={value}>{value}</option>)}</select></label></div>
          <div className={styles.formGrid}>{["A", "B", "C", "D", "E"].map((key) => <label className={styles.fieldLabel} key={key}>Pilihan {key}<input value={question.options[key]} onChange={(event) => setQuestion((current) => ({ ...current, options: { ...current.options, [key]: event.target.value } }))} maxLength={500} required /></label>)}</div>
          <label className={styles.toggleField}><input type="checkbox" checked={question.status === "Aktif"} onChange={(event) => setQuestion((current) => ({ ...current, status: event.target.checked ? "Aktif" : "Draft" }))} /><span>Langsung aktifkan soal ini</span></label>
          <ModuleMessage error={error} />
          <div className={styles.moduleActions}><button className={styles.secondaryButton} type="button" onClick={() => setShowForm(false)}>Batal</button><button className={styles.primaryButton} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Soal"}</button></div>
        </form>
      </section></div>}
    </div>
  );
}

function SelectionModule({ applicants, search, refresh }) {
  const [filter, setFilter] = useState("Semua");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [notes, setNotes] = useState({});
  const [examScores, setExamScores] = useState({});
  const options = ["Semua", "Dalam Proses", "Lolos", "Tidak Lolos"];
  const filtered = applicants.filter((item) =>
    (filter === "Semua" || item.selectionStatus === filter) &&
    `${item.name} ${item.email} ${item.registrationNo || ""} ${item.major || ""}`
      .toLocaleLowerCase("id-ID").includes(search.trim().toLocaleLowerCase("id-ID"))
  );
  const totals = [
    ["Dalam Proses", applicants.filter((item) => item.selectionStatus === "Dalam Proses").length],
    ["Lolos", applicants.filter((item) => item.selectionStatus === "Lolos").length],
    ["Tidak Lolos", applicants.filter((item) => item.selectionStatus === "Tidak Lolos").length],
  ];
  async function decide(item, status) {
    const score = item.finalScore ?? examScores[item.id] ?? item.examScore ?? "";
    setSavingId(item.id); setError("");
    try {
      await requestAdmin("/api/admin", { method: "PATCH", body: JSON.stringify({
        action: "decide-selection",
        id: item.id,
        status,
        examScore: examScores[item.id] ?? item.examScore ?? "",
        finalScore: score,
        note: notes[item.id] || "",
      }) });
      await refresh();
    } catch (failure) { setError(failure.message); }
    finally { setSavingId(""); }
  }
  return <div className={styles.moduleStack}>
    <section className={styles.reportSummary}>
      {totals.map(([label, value]) => <article className={styles.reportMetric} key={label}><span>{label}</span><strong>{value}</strong></article>)}
      <article className={styles.reportMetric}><span>Rata-rata Nilai TPA</span><strong>{applicants.filter((item) => item.examScore !== null).length
        ? (applicants.reduce((sum, item) => sum + (item.examScore ?? 0), 0) / applicants.filter((item) => item.examScore !== null).length).toFixed(1)
        : "—"}</strong></article>
    </section>
    <section className={styles.modulePanel}>
    <div className={styles.moduleTitleRow}><div><span className={styles.moduleEyebrow}>HASIL SELEKSI</span><h2>Seleksi Calon Siswa</h2><p>Tinjau nilai tes dan simpan keputusan penerimaan.</p></div><span className={styles.moduleCount}>{filtered.length} pendaftar</span></div>
    <ModuleMessage error={error} />
    <div className={styles.moduleToolbar}><label className={styles.moduleFilter}>Status seleksi<select value={filter} onChange={(event) => setFilter(event.target.value)}>{options.map((value) => <option key={value}>{value}</option>)}</select></label></div>
    <div className={styles.moduleTableScroll}><table className={styles.moduleTable}>
      <thead><tr><th>Calon siswa</th><th>Jurusan</th><th>Nilai TPA</th><th>Nilai akhir</th><th>Status</th><th>Catatan keputusan</th><th>Aksi</th></tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.id}>
        <td><span className={styles.moduleStudent}><span className={styles.moduleAvatar}>{initials(item.name)}</span><span><strong>{item.name}</strong><small>{display(item.registrationNo)}</small></span></span></td>
        <td>{display(item.major)}</td>
        <td><input className={styles.inlineInput} type="number" min="0" max="100" step="0.01" value={examScores[item.id] ?? item.examScore ?? ""} aria-label={`Nilai TPA ${item.name}`} onChange={(event) => setExamScores((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Nilai TPA" /></td>
        <td>{item.finalScore ?? "—"}</td><td><Status>{item.selectionStatus}</Status></td>
        <td><input className={styles.inlineInput} value={notes[item.id] ?? ""} maxLength={2000} aria-label={`Catatan seleksi ${item.name}`} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Catatan..." /></td>
        <td><div className={styles.tableActions}><button type="button" className={styles.primarySmallButton} disabled={savingId === item.id} onClick={() => decide(item, "Lolos")}>Terima</button><button type="button" className={styles.dangerSmallButton} disabled={savingId === item.id} onClick={() => decide(item, "Tidak Lolos")}>Tolak</button><button type="button" className={styles.secondarySmallButton} disabled={savingId === item.id} onClick={() => decide(item, "Dalam Proses")}>Proses</button></div></td>
      </tr>)}{!filtered.length && <tr><td className={styles.moduleEmpty} colSpan={7}>Tidak ada calon siswa yang cocok.</td></tr>}</tbody>
    </table></div>
    </section>
  </div>;
}

function ReportsModule({ search }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [majorFilter, setMajorFilter] = useState("Semua");
  useEffect(() => {
    requestAdmin("/api/admin?view=reports")
      .then(setData)
      .catch((failure) => setError(failure.message));
  }, []);
  const applicants = data?.applicants || [];
  const majors = [...new Set(applicants.map((item) => item.major).filter(Boolean))].sort();
  const rows = applicants.filter((item) =>
    (statusFilter === "Semua" || item.selectionStatus === statusFilter) &&
    (majorFilter === "Semua" || item.major === majorFilter) &&
    `${item.name} ${item.email} ${item.registrationNo || ""}`
      .toLocaleLowerCase("id-ID").includes(search.trim().toLocaleLowerCase("id-ID"))
  );
  const totals = data?.totals || { applicants: 0, verified: 0, accepted: 0, waiting: 0 };
  function exportCsv() {
    const fields = ["name", "email", "registrationNo", "nisn", "major", "phone", "paymentStatus", "verificationStatus", "examScore", "finalScore", "selectionStatus"];
    const header = ["Nama", "Email", "No. Pendaftaran", "NISN", "Jurusan", "Telepon", "Pembayaran", "Verifikasi", "Nilai TPA", "Nilai Akhir", "Hasil Seleksi"];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const content = [header, ...rows.map((item) => fields.map((field) => item[field]))]
      .map((line) => line.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-spmb-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return <div className={styles.moduleStack}>
    <ModuleMessage error={error} />
    <section className={styles.reportSummary}>
      {[["Total Pendaftar", totals.applicants], ["Terverifikasi", totals.verified], ["Lolos Seleksi", totals.accepted], ["Dalam Proses", totals.waiting]].map(([label, value]) => <article className={styles.reportMetric} key={label}><span>{label}</span><strong>{value}</strong></article>)}
    </section>
    <section className={styles.modulePanel}>
      <div className={styles.moduleTitleRow}><div><span className={styles.moduleEyebrow}>REKAPITULASI</span><h2>Laporan Penerimaan Siswa</h2><p>Ringkasan berdasarkan data pendaftar yang tersimpan.</p></div><button className={styles.primaryButton} type="button" onClick={exportCsv} disabled={!rows.length}>Unduh CSV</button></div>
      <div className={styles.moduleToolbar}>
        <label className={styles.moduleFilter}>Hasil seleksi<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{["Semua", "Dalam Proses", "Lolos", "Tidak Lolos"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className={styles.moduleFilter}>Jurusan<select value={majorFilter} onChange={(event) => setMajorFilter(event.target.value)}><option>Semua</option>{majors.map((major) => <option key={major}>{major}</option>)}</select></label>
        <span className={styles.moduleCount}>{rows.length} baris laporan</span>
      </div>
      <div className={styles.moduleTableScroll}><table className={styles.moduleTable}>
        <thead><tr><th>Calon siswa</th><th>Jurusan</th><th>Pembayaran</th><th>Verifikasi</th><th>Nilai TPA</th><th>Nilai akhir</th><th>Seleksi</th><th>Terdaftar</th></tr></thead>
        <tbody>{rows.map((item) => <tr key={item.id}><td><span className={styles.moduleStudent}><span className={styles.moduleAvatar}>{initials(item.name)}</span><span><strong>{item.name}</strong><small>{item.registrationNo || item.email}</small></span></span></td><td>{display(item.major)}</td><td><Status>{item.paymentStatus || "Belum diisi"}</Status></td><td><Status>{item.verificationStatus}</Status></td><td>{item.examScore ?? "—"}</td><td>{item.finalScore ?? "—"}</td><td><Status>{item.selectionStatus}</Status></td><td>{dateLabel(item.createdAt)}</td></tr>)}
          {!rows.length && <tr><td className={styles.moduleEmpty} colSpan={8}>Tidak ada data laporan untuk filter ini.</td></tr>}</tbody>
      </table></div>
    </section>
  </div>;
}

const moduleTitles = {
  "Data Calon Siswa": "Data Calon Siswa",
  "Tes TPA": "Tes TPA",
  "Seleksi Calon Siswa": "Seleksi Calon Siswa",
  Verify: "Verifikasi Calon Siswa",
  Laporan: "Laporan Penerimaan",
};

export default function AdminModules({ section, search }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const moduleTitle = useMemo(() => moduleTitles[section] || section, [section]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const result = await requestAdmin("/api/admin?view=applicants");
      setData(result.applicants);
      setHistory(result.history);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);
  const notify = (message) => setNotice(message);
  const content = !data && loading
    ? <section className={styles.modulePanel}><p className={styles.moduleHint}>Memuat data administrasi...</p></section>
    : !data
      ? <section className={styles.modulePanel}><ModuleMessage error={error} /><button className={styles.secondaryButton} type="button" onClick={refresh}>Coba Lagi</button></section>
      : section === "Data Calon Siswa"
        ? <ApplicantModule applicants={data} search={search} refresh={refresh} notify={notify} />
        : section === "Verify"
          ? <VerifyModule applicants={data} history={history} search={search} refresh={refresh} notify={notify} />
          : section === "Tes TPA"
            ? <TpaModule refresh={refresh} notify={notify} />
            : section === "Seleksi Calon Siswa"
              ? <SelectionModule applicants={data} search={search} refresh={refresh} />
              : <ReportsModule search={search} />;

  return (
    <div className={styles.modulePage}>
      <div className={styles.moduleHeading}>
        <div><span className={styles.moduleEyebrow}>ADMINISTRASI SPMB</span><h1>{moduleTitle}</h1><p>Kelola proses penerimaan calon siswa SMK Citra Negara.</p></div>
        <button className={styles.secondaryButton} type="button" onClick={refresh} disabled={loading}>↻ Perbarui Data</button>
      </div>
      <ModuleMessage notice={notice} />
      {content}
    </div>
  );
}
