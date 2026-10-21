"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

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

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login gagal.");
        return;
      }

      const destinations = {
        calon_siswa: "/dashboard/calon-siswa",
        admin: "/dashboard/admin",
        kepsek: "/dashboard/kepsek",
      };
      const role = data.user?.role;
      const destination =
        typeof role === "string" && Object.hasOwn(destinations, role)
          ? destinations[role]
          : undefined;

      if (!destination) {
        setMessage("Role akun tidak dikenali.");
        return;
      }

      router.push(destination);
      router.refresh();
    } catch (error) {
      console.error("Login request failed:", error);
      setMessage("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.formWrap}>
      <header className={styles.heading}>
        <h1 id="login-title">Selamat Datang Kembali 👋</h1>
        <p>Masuk ke akun SPMB kamu untuk melanjutkan proses pendaftaran</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Email</span>
          <span className={styles.input}>
            <FieldIcon type="email" />
            <input
              type="email"
              name="email"
              placeholder="Masukkan email"
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
              autoComplete="current-password"
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

        <div className={styles.options}>
          <label className={styles.remember}>
            <input type="checkbox" name="remember" />
            <span>Ingat saya</span>
          </label>
          <button
            type="button"
            className={styles.forgot}
            onClick={() => setMessage("Fitur lupa password belum tersedia.")}
          >
            Lupa password?
          </button>
        </div>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : <>Masuk <span aria-hidden="true">→</span></>}
        </button>
        <p className={styles.message} role="status" aria-live="polite">
          {message}
        </p>
      </form>

      <p className={styles.register}>
        Belum punya akun? <Link href="/register">Daftar Sekarang</Link>
      </p>
    </div>
  );
}