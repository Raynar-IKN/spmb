import RegisterForm from "./register-form";
import Image from "next/image";
import styles from "./register.module.css";

export const metadata = {
  title: "Daftar Akun | SPMB SMK Citra Negara",
  description: "Buat akun untuk melanjutkan proses pendaftaran SPMB.",
};

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <section className={styles.visual} aria-label="Informasi pendaftaran SPMB">
        <Image
          className={styles.image}
          src="/assets/register-panel.png"
          width={651}
          height={1024}
          loading="eager"
          alt="Buat akun sekarang! Lengkapi data diri kamu untuk memulai proses pendaftaran SPMB."
        />
      </section>

      <section className={styles.content} aria-labelledby="register-title">
        <RegisterForm />
      </section>
    </main>
  );
}

