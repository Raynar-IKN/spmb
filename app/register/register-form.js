"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

function FieldIcon({ type }) {
  if (type === "password") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5z" />
        <circle cx="12" cy="15" r="1.5" />
        <path d="M12 16.5V18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3zM3.5 6l8.5 7 8.5-7" />
    </svg>
  );
}

function VisibilityIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!visible && <path d="m4 20 16-16" />}
    </svg>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nama = formData.get("nama");
    const email = formData.get("email");
    const password = formData.get("password");

    if (password !== formData.get("confirmation")) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nama, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Pendaftaran gagal.");
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Register request failed:", error);
      setMessage("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.formWrap}>
      <header className={styles.heading}>
        <h2 id="register-title">Daftar Akun</h2>
        <p>Buat akun untuk melanjutkan proses pendaftaran.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Nama Lengkap</span>
          <span className={styles.input}>
            <FieldIcon type="email" />
            <input
              type="text"
              name="nama"
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
              required
            />
          </span>
        </label>

        <label className={styles.field}>
          <span>Email</span>
          <span className={styles.input}>
            <FieldIcon type="email" />
            <input
              type="email"
              name="email"
              placeholder="Masukkan email aktif"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <span className={styles.input}>
            <FieldIcon type="password" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Masukkan password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className={styles.visibility}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <VisibilityIcon visible={showPassword} />
            </button>
          </span>
        </label>

        <label className={styles.field}>
          <span>Konfirmasi Password</span>
          <span className={styles.input}>
            <FieldIcon type="password" />
            <input
              type={showConfirmation ? "text" : "password"}
              name="confirmation"
              placeholder="Ulangi password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className={styles.visibility}
              aria-label={showConfirmation ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowConfirmation((visible) => !visible)}
            >
              <VisibilityIcon visible={showConfirmation} />
            </button>
          </span>
        </label>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : <>Daftar <span aria-hidden="true">→</span></>}
        </button>
        <p className={styles.message} role="status" aria-live="polite">
          {message}
        </p>
      </form>

      <p className={styles.login}>
        Sudah punya akun? <Link href="/login">Masuk Sekarang</Link>
      </p>
    </div>
  );
}