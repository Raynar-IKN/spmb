import Image from "next/image";
import LoginForm from "./login-form";
import styles from "./login.module.css";

export const metadata = {
  title: "Masuk | SPMB SMK Citra Negara",
  description: "Masuk ke akun SPMB untuk melanjutkan proses pendaftaran.",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.visual} aria-label="Informasi SPMB">
        <Image
          className={styles.image}
          src="/assets/login-panel.png"
          width={651}
          height={1024}
          loading="eager"
          alt="Mulai perjalanan pendidikanmu bersama SMK Citra Negara."
        />
      </section>

      <section className={styles.content} aria-labelledby="login-title">
        <LoginForm />
      </section>
    </main>
  );
}
