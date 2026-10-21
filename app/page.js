/* eslint-disable @next/next/no-img-element */
// app/page.js  (Next.js App Router)
//
// Gambar (foto, logo, background)  -> public/assets/
// Ikon                             -> public/icons/
// Daftar lengkap file + node Figma -> lihat ASSETS.md

const ASSET = "/assets";
const ICON = "/icons";

const keunggulan = [
  {
    icon: "kualitas.svg",
    title: "Pendidikan berkualitas",
    text: "Didukung oleh tenaga pendidik profesional dan berpengalaman",
  },
  {
    icon: "siap-kerja.svg",
    title: "Siap Kerja",
    text: "Banyak kesempatan magang dan penyaluran kerja",
  },
  {
    icon: "fasilitas.svg",
    title: "Fasilitas Modern",
    text: "Dilengkapi dengan sarana dan prasarana yang lengkap",
  },
  {
    icon: "prestasi.svg",
    title: "Berprestasi",
    text: "Raih berbagai prestasi di tingkat regional maupun internasional",
  },
];

const nilaiSekolah = [
  "Terakreditasi A",
  "Tenaga Pendidik Profesional",
  "Fasilitas Lengkap & Modern",
  "Lingkungan Belajar Nyaman",
];

// inset = jarak ikon & judul dari sisi kiri kartu (sesuai posisi di Figma)
const jurusan = [
  { nama: "Teknik Jaringan Komputer dan Telekomunikasi", foto: "jurusan-tjkt.png", icon: "jurusan-tjkt.png", w: 30, h: 30, inset: 25 },
  { nama: "Desain Komunikasi Visual", foto: "jurusan-dkv.png", icon: "jurusan-dkv.png", w: 30, h: 34, inset: 35 },
  { nama: "Manajemen Perkantoran dan Layanan Bisnis", foto: "jurusan-mplb.png", icon: "jurusan-mplb.png", w: 30, h: 34, inset: 34 },
  { nama: "Pengembangan Perangkat Lunak dan Gim", foto: "jurusan-pplg.png", icon: "jurusan-pplg.png", w: 32, h: 30, inset: 23 },
  { nama: "Bisnis Digital dan Ritel", foto: "jurusan-bisnis.png", icon: "jurusan-bisnis.png", w: 30, h: 34, inset: 33 },
  { nama: "Perhotelan", foto: "jurusan-perhotelan.png", icon: "jurusan-perhotelan.png", w: 30, h: 30, inset: 33 },
];

const langkah = [
  { no: 1, icon: "step-1.svg", judul: "Daftar Akun", teks: ["Buat akun di website", "SMK Citra Negara."] },
  { no: 2, icon: "step-2.svg", judul: "Lengkapi Biodata", teks: ["Isi data diri dengan benar dan lengkap."] },
  { no: 3, icon: "step-3.svg", judul: "Upload Dokumen", teks: ["Unggah berkas yang dibutuhkan."] },
  { no: 4, icon: "step-4.svg", judul: "Ikuti Tes TPA", teks: ["Mengikuti Tes Potensi Akademik"] },
];

// Gambar logo mitra dipotong (crop) di dalam kartu persis seperti di Figma.
const mitra = [
  { src: "mitra-1.png", alt: "Mitra industri 1", crop: { height: "162%", left: "11.12%", top: "-31%", width: "77.76%" } },
  { src: "mitra-2.png", alt: "Teknisigo", crop: { height: "124%", left: "20.24%", top: "-12%", width: "59.52%" } },
  { src: "mitra-3.png", alt: "Bank BJB", crop: { height: "144%", left: "15.53%", top: "-11.64%", width: "69.12%" } },
  { src: "mitra-4.png", alt: "Ramayana", crop: { height: "101%", left: "25.76%", top: "-0.5%", width: "48.48%" } },
];

const linkInformasi = [
  { label: "Tentang Sekolah", href: "#tentang" },
  { label: "Jurusan", href: "#jurusan" },
  { label: "Mitra Kerja", href: "#mitra" },
  { label: "SPMB", href: "#alur" },
];

const sosmed = [
  { src: "facebook.svg", alt: "Facebook", href: "#" },
  { src: "instagram.svg", alt: "Instagram", href: "#" },
  { src: "tiktok.svg", alt: "TikTok", href: "#" },
  { src: "youtube.svg", alt: "YouTube", href: "#" },
];

export default function LandingPage() {
  return (
    <div className="lp">
      {/* ================= HEADER ================= */}
      <header className="lp-header">
        <div className="lp-header__inner">
          <a href="#beranda" className="lp-brand">
            <img src={`${ASSET}/logo.png`} alt="Logo SMK Citra Negara" className="lp-brand__logo" />
            <span className="lp-brand__text">
              <strong>SPMB</strong>
              <small>Sistem Penerimaan Murid Baru</small>
            </span>
          </a>

          <nav className="lp-nav" aria-label="Navigasi utama">
            <a href="#beranda">Beranda</a>
            <a href="#jurusan">Jurusan</a>
            <a href="#alur">Alur SPMB</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a href="/login" className="lp-login">
            <img src={`${ICON}/login.svg`} alt="" width="21" height="21" />
            <span>Login</span>
          </a>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section id="beranda" className="lp-hero">
          <div className="lp-hero__stage">
            <div className="lp-hero__content">
              <span className="lp-badge">
                <img src={`${ICON}/megaphone.svg`} alt="" width="16" height="16" />
                <span>Penerimaan Murid Baru 2027/2028</span>
              </span>

              <h1 className="lp-hero__title">
                <span>Wujudkan Langkahmu</span>
                <span className="lp-hero__accent">Menuju Masa Depan</span>
                <span>yang lebih baik</span>
              </h1>

              <p className="lp-hero__desc">
                Bergabunglah bersama kami dan raih pendidikan berkualitas untuk masa depan yang cerah.
              </p>

              <div className="lp-hero__actions">
                <a href="#alur" className="lp-btn lp-btn--primary">Daftar Sekarang →</a>
                <a href="#tentang" className="lp-btn lp-btn--outline">Pelajari SPMB</a>
              </div>
            </div>

            <img src={`${ASSET}/hero.png`} alt="Gedung SMK Citra Negara" className="lp-hero__image" />
          </div>
        </section>

        {/* ================= KEUNGGULAN ================= */}
        <section id="keunggulan" className="lp-keunggulan">
          <div className="lp-keunggulan__inner">
            <div className="lp-keunggulan__intro">
              <p className="lp-eyebrow">Mengapa Memilih Kami?</p>
              <h2 className="lp-h2">Keunggulan Sekolah Kami</h2>
              <p className="lp-keunggulan__desc">
                Kami berkomitmen memberikan pendidikan terbaik dengan fasilitas modern dan lingkungan yang nyaman.
              </p>
            </div>

            <div className="lp-keunggulan__cards">
              {keunggulan.map((item) => (
                <article key={item.title} className="lp-card">
                  <div className="lp-icon-box">
                    <img src={`${ICON}/${item.icon}`} alt="" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TENTANG ================= */}
        <section id="tentang" className="lp-tentang">
          <div className="lp-tentang__inner">
            <img src={`${ASSET}/tentang.png`} alt="Suasana SMK Citra Negara" className="lp-tentang__image" />
            <div className="lp-tentang__content">
              <p className="lp-eyebrow">Tentang Sekolah</p>
              <h2 className="lp-h2">Mengenal Sekolah Kami</h2>
              <p className="lp-tentang__desc">
                SMK Citra Negara Depok adalah sekolah kejuruan swasta terakreditasi A di Beji, Depok, yang berdiri
                sejak 2004 dan menawarkan enam jurusan siap kerja (TJKT, PPLG, MPLB, DKV, Pemasaran, Perhotelan)
                dengan fasilitas teknologi modern berbasis praktik langsung.
              </p>
              <ul className="lp-checklist">
                {nilaiSekolah.map((n) => (
                  <li key={n}>
                    <img src={`${ICON}/check.svg`} alt="" width="24" height="24" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= JURUSAN ================= */}
        <section id="jurusan" className="lp-jurusan">
          <div className="lp-wrap">
            <p className="lp-eyebrow">Program Keahlian</p>
            <h2 className="lp-h2">Jurusan di SMK Citra Negara</h2>
            <p className="lp-jurusan__desc">
              Pilih jurusan sesuai dengan minat dan bakatmu.
              <br />
              Kami memiliki program keahlian yang relevan dengan kebutuhan
              <br />
              industri dan dunia kerja
            </p>

            <div className="lp-jurusan__grid">
              {jurusan.map((j) => (
                <article
                  key={j.nama}
                  className="lp-jurusan__card"
                  style={{ backgroundImage: `url(${ASSET}/${j.foto})`, "--inset": `${j.inset}px` }}
                >
                  <div className="lp-jurusan__overlay" />
                  <div className="lp-jurusan__info">
                    <span className="lp-jurusan__icon">
                      <img src={`${ICON}/${j.icon}`} alt="" width={j.w} height={j.h} />
                    </span>
                    <h3>{j.nama}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ALUR ================= */}
        <section id="alur" className="lp-alur">
          <div className="lp-alur__wrap">
            <div className="lp-alur__box">
              <div className="lp-alur__intro">
                <p className="lp-eyebrow">Alur Pendaftaran</p>
                <h2 className="lp-h2">Mudah &amp; Cepat</h2>
                <p className="lp-alur__desc">
                  Ikuti langkah-langkah berikut untuk
                  <br />
                  mendaftar di SMK Citra Negara.
                </p>
                <a href="#" className="lp-btn lp-btn--outline lp-btn--sm">Lihat Selengkapnya →</a>
              </div>

              <ol className="lp-alur__steps">
                {langkah.map((l, i) => (
                  <li key={l.no} className="lp-step">
                    <div className="lp-step__top">
                      <span className="lp-step__no">
                        <img src={`${ICON}/step-circle.svg`} alt="" width="60" height="60" />
                        <b>{l.no}</b>
                      </span>
                      <span className="lp-icon-box">
                        <img src={`${ICON}/${l.icon}`} alt="" />
                      </span>
                    </div>
                    <h3>{l.judul}</h3>
                    <p>
                      {l.teks.map((t, idx) => (
                        <span key={idx}>
                          {t}
                          {idx < l.teks.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                    {i < langkah.length - 1 && (
                      <img src={`${ICON}/step-arrow.svg`} alt="" width="16" height="14" className="lp-step__arrow" />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ================= MITRA ================= */}
        <section id="mitra" className="lp-mitra">
          <div className="lp-wrap">
            <p className="lp-eyebrow">Kerja Sama Industri</p>
            <h2 className="lp-h2">Mitra &amp; Dunia Kerja</h2>
            <p className="lp-mitra__desc">
              Kami menjalin kerja sama dengan berbagai perusahaan
              <br />
              dan industri ternama untuk memberikan kesempatan
              <br />
              magang dan penyaluran kerja bagi siswa/i kami.
            </p>

            <div className="lp-mitra__grid">
              {mitra.map((m) => (
                <div key={m.src} className="lp-mitra__card">
                  <img src={`${ASSET}/${m.src}`} alt={m.alt} style={m.crop} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__grid">
            <div className="lp-footer__brand">
              <div className="lp-footer__brand-row">
                <img src={`${ASSET}/logo.png`} alt="Logo SMK Citra Negara" />
                <div>
                  <h3>SMK CITRA NEGARA</h3>
                  <p>Sekolah Menegah Kejuruan</p>
                </div>
              </div>
              <p className="lp-footer__tagline">Pilihan Yang Tepat Di Sekolah Yang M.A.N.T.A.P</p>
            </div>

            <div className="lp-footer__col">
              <h3>Informasi</h3>
              <ul className="lp-footer__links">
                {linkInformasi.map((l) => (
                  <li key={l.label}>
                    <img src={`${ICON}/chevron.svg`} alt="" width="9" height="12" />
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lp-footer__col">
              <h3>Hubungi Kami</h3>
              <ul className="lp-contact">
                <li>
                  <span className="lp-contact__icon">
                    <img src={`${ICON}/circle.svg`} alt="" width="42" height="42" />
                    <img src={`${ICON}/lokasi.svg`} alt="" className="lp-contact__glyph" />
                  </span>
                  <div>
                    <b>Alamat</b>
                    <p>Jl. Raya Tanah Baru Kemiri Jaya II No. 99, Beji, Kecamatan Beji, Kota Depok, Jawa Barat 16421.</p>
                  </div>
                </li>
                <li>
                  <span className="lp-contact__icon">
                    <img src={`${ICON}/circle.svg`} alt="" width="42" height="42" />
                    <img src={`${ICON}/email.svg`} alt="" className="lp-contact__glyph" />
                  </span>
                  <div>
                    <b>Email</b>
                    <p>
                      <a href="mailto:info@citranegara.sch.id">info@citranegara.sch.id</a>
                    </p>
                  </div>
                </li>
                <li>
                  <span className="lp-contact__icon">
                    <img src={`${ICON}/circle.svg`} alt="" width="42" height="42" />
                    <img src={`${ICON}/telepon.svg`} alt="" className="lp-contact__glyph" />
                  </span>
                  <div>
                    <b>Telepon</b>
                    <p>
                      <a href="tel:02177201052">(021) 77201052</a>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lp-footer__col">
              <h3>Ikuti kami</h3>
              <ul className="lp-social">
                {sosmed.map((s) => (
                  <li key={s.alt}>
                    <a href={s.href} aria-label={s.alt}>
                      <img src={`${ICON}/${s.src}`} alt="" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="lp-footer__copy">Copyright © 2026 · SMK Citra Negara · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}