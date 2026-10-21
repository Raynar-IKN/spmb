"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminModules from "./admin-modules";
import styles from "./dashboard.module.css";

const navigation = [
  {
    label: "Data Calon Siswa",
    icon: "/icons/dashboard-nav-students.svg",
  },
  { label: "Tes TPA", icon: "/icons/dashboard-nav-tpa.svg" },
  {
    label: "Seleksi Calon Siswa",
    icon: "/icons/dashboard-nav-selection.svg",
  },
  {
    label: "Verify",
    icon: "/icons/dashboard-nav-verification.svg",
  },
  { label: "Laporan", icon: "/icons/dashboard-nav-reports.svg" },
];

const summaryCards = [
  {
    label: "Total Calon Siswa",
    valueKey: "applicants",
    icon: "/icons/dashboard-user-group.svg",
    iconWidth: 21.0001,
    iconHeight: 18.75,
    tone: "mint",
  },
  {
    label: "Lolos Seleksi",
    valueKey: "accepted",
    icon: "/icons/dashboard-clipboard-cancel.svg",
    iconWidth: 24,
    iconHeight: 24,
    tone: "green",
  },
  {
    label: "Total Tidak Lolos Seleksi",
    valueKey: "rejected",
    icon: "/icons/dashboard-clipboard-check.svg",
    iconWidth: 16,
    iconHeight: 20,
    tone: "rose",
  },
  {
    label: "Dalam Proses Seleksi",
    valueKey: "inProgress",
    icon: "/icons/dashboard-clipboard-list.svg",
    iconWidth: 24,
    iconHeight: 24,
    tone: "violet",
  },
];

function getMonthSeries(currentMonth, trendRows, period) {
  if (!currentMonth) return [];

  const totalsByMonth = new Map(
    trendRows.map((row) => [row.month, row.total])
  );
  const [year, month] = currentMonth.split("-").map(Number);

  return Array.from({ length: period }, (_, index) => {
    const date = new Date(Date.UTC(year, month - period + index, 1));
    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    return {
      key,
      label: new Intl.DateTimeFormat("id-ID", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      total: totalsByMonth.get(key) ?? 0,
    };
  });
}

function RegistrationChart({ data, hasRegistrationDates }) {
  if (!hasRegistrationDates || data.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        <span>Tren belum tersedia</span>
        <p>
          {hasRegistrationDates
            ? "Data pendaftaran belum tersedia untuk periode ini."
            : "Kolom tanggal pendaftaran belum tersedia pada data akun."}
        </p>
      </div>
    );
  }

  const maxValue = Math.max(1, ...data.map((item) => item.total));
  const left = 46;
  const right = 704;
  const top = 18;
  const bottom = 154;
  const points = data.map((item, index) => ({
    ...item,
    x: left + (data.length === 1 ? 0 : (index / (data.length - 1)) * (right - left)),
    y: bottom - (item.total / maxValue) * (bottom - top),
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${right} ${bottom} L ${left} ${bottom} Z`;

  return (
    <svg
      className={styles.chartSvg}
      viewBox="0 0 720 190"
      preserveAspectRatio="none"
      role="img"
      aria-label="Grafik jumlah pendaftar per bulan"
    >
      <defs>
        <linearGradient id="registration-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#46c7a0" stopOpacity=".28" />
          <stop offset="100%" stopColor="#46c7a0" stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((step) => {
        const y = top + ((bottom - top) / 4) * step;
        const value = Math.round(maxValue * (1 - step / 4));

        return (
          <g key={step}>
            <line
              x1={left}
              x2={right}
              y1={y}
              y2={y}
              stroke="#e6eff0"
              strokeWidth="1"
            />
            <text
              x={36}
              y={y + 3}
              textAnchor="end"
              fill="#6e98b2"
              fontSize="9"
            >
              {value}
            </text>
          </g>
        );
      })}
      {points.length > 1 && (
        <>
          <path d={areaPath} fill="url(#registration-area)" />
          <path
            d={linePath}
            fill="none"
            stroke="#009879"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {points.map((point) => (
        <g key={point.key}>
          <circle cx={point.x} cy={point.y} r="3.5" fill="#009879" />
          <text
            x={point.x}
            y={Math.max(12, point.y - 9)}
            textAnchor="middle"
            fill="#3c72a0"
            fontSize="9"
          >
            {point.total}
          </text>
          <text
            x={point.x}
            y="178"
            textAnchor="middle"
            fill="#4b84b5"
            fontSize="9"
          >
            {point.label}
          </text>
        </g>
      ))}
      {points.length === 1 && (
        <circle cx={points[0].x} cy={points[0].y} r="3.5" fill="#009879" />
      )}
    </svg>
  );
}

function formatTime(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AdminDashboard({
  adminName,
  applicants,
  totalApplicants,
  trendRows,
  currentMonth,
  hasRegistrationDates,
  selectionTotals,
  majorTotals,
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState(6);
  const [showAll, setShowAll] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notice, setNotice] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const selectionValues = {
    applicants: totalApplicants,
    ...selectionTotals,
  };
  const monthSeries = getMonthSeries(currentMonth, trendRows, period);
  const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");
  const matchingApplicants = applicants.filter((applicant) =>
    `${applicant.nama} ${applicant.email} ${applicant.id}`
      .toLocaleLowerCase("id-ID")
      .includes(normalizedSearch)
  );
  const visibleApplicants = matchingApplicants.slice(0, showAll ? 100 : 6);

  useEffect(() => {
    const sections = ["Dashboard", ...navigation.map((item) => item.label)];
    const readSection = () => {
      const requested = decodeURIComponent(window.location.hash.slice(1));
      setActiveSection(sections.includes(requested) ? requested : "Dashboard");
    };
    readSection();
    window.addEventListener("popstate", readSection);
    window.addEventListener("hashchange", readSection);
    return () => {
      window.removeEventListener("popstate", readSection);
      window.removeEventListener("hashchange", readSection);
    };
  }, []);

  function handleNavigation(label) {
    setNotice("");
    setActiveSection(label);
    const hash = label === "Dashboard" ? "" : `#${encodeURIComponent(label)}`;
    window.history.pushState({}, "", `${window.location.pathname}${window.location.search}${hash}`);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setNotice("");

    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout gagal.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout request failed:", error);
      setNotice("Tidak dapat keluar. Silakan coba lagi.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="#dashboard" aria-label="SPMB SMK Citra Negara">
          <Image
            src="/assets/logo.png"
            alt=""
            width={53}
            height={45}
            className={styles.brandLogo}
          />
          <span className={styles.brandText}>
            <strong>SMK Citra Negara</strong>
            <small>SPMB - Calon Siswa</small>
          </span>
        </a>

        <nav className={styles.navigation} aria-label="Menu admin">
          <button
            className={`${styles.navItem} ${activeSection === "Dashboard" ? styles.navItemActive : ""}`}
            onClick={() => handleNavigation("Dashboard")}
            type="button"
          >
            <span className={styles.homeIcon} aria-hidden="true">⌂</span>
            <span>Dashboard</span>
          </button>
          {navigation.map((item) => (
            <button
              className={`${styles.navItem} ${activeSection === item.label ? styles.navItemActive : ""}`}
              key={item.label}
              onClick={() => handleNavigation(item.label)}
              type="button"
            >
              <Image
                src={item.icon}
                alt=""
                width={24}
                height={24}
                unoptimized
              />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <p className={styles.sidebarQuote}>
          “Pilihan Yang Tepat
          <br />
          di Sekolah”
          <br />
          Yang M.A.N.T.A.P
        </p>

        <button
          className={styles.logout}
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          <Image
            src="/icons/dashboard-logout.svg"
            alt=""
            width={16}
            height={16}
            unoptimized
          />
          <span>{isLoggingOut ? "Keluar..." : "Logout"}</span>
        </button>
      </aside>

      <main className={styles.main} id="dashboard">
        <header className={styles.topbar}>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowAll(Boolean(event.target.value.trim()));
              }}
              placeholder="Cari menu atau informasi..."
              aria-label="Cari calon siswa"
            />
          </label>

          <div className={styles.account}>
            <div className={styles.notificationWrap}>
              <button
                className={styles.notificationButton}
                type="button"
                aria-label="Notifikasi pendaftar terbaru"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((open) => !open)}
              >
                <span aria-hidden="true">♧</span>
              </button>
              {showNotifications && (
                <div className={styles.notificationPanel}>
                  <strong>Aktivitas terbaru</strong>
                  {applicants.slice(0, 3).length > 0 ? (
                    applicants.slice(0, 3).map((applicant) => (
                      <p key={applicant.id}>
                        <span>{applicant.nama}</span>
                        <small>Mendaftar sebagai calon siswa</small>
                      </p>
                    ))
                  ) : (
                    <p className={styles.notificationEmpty}>
                      Belum ada pendaftar baru.
                    </p>
                  )}
                </div>
              )}
            </div>
            <span className={styles.profileAvatar} aria-hidden="true">👨🏻‍💼</span>
            <span className={styles.profileText}>
              <strong>{adminName}</strong>
              <small>Admin</small>
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {activeSection === "Dashboard" ? (
            <>
          <div className={styles.heading}>
            <h1>Selamat Datang, Admin!</h1>
            <p>
              Kelola data pendaftaran, proses seleksi, dan verifikasi calon
              siswa dengan mudah dan cepat.
            </p>
          </div>

          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}

          <div className={styles.dashboardGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.summaryGrid} aria-label="Ringkasan pendaftaran">
                {summaryCards.map((card) => (
                  <article className={styles.summaryCard} key={card.label}>
                    <span className={`${styles.summaryIcon} ${styles[card.tone]}`}>
                      <Image
                        src={card.icon}
                        alt=""
                        width={card.iconWidth}
                        height={card.iconHeight}
                        unoptimized
                      />
                    </span>
                    <p>{card.label}</p>
                    <strong>
                      {selectionValues[card.valueKey].toLocaleString("id-ID")}
                    </strong>
                  </article>
                ))}
              </section>

              <section
                className={`${styles.panel} ${styles.chartPanel}`}
                aria-labelledby="trend-title"
              >
                <div className={styles.panelHeading}>
                  <h2 id="trend-title">Tren Pendaftaran Calon Siswa</h2>
                  <label className={styles.periodSelect}>
                    <span className={styles.visuallyHidden}>Periode grafik</span>
                    <select
                      value={period}
                      onChange={(event) => setPeriod(Number(event.target.value))}
                    >
                      <option value={6}>6 Bulan Terakhir</option>
                      <option value={12}>12 Bulan Terakhir</option>
                    </select>
                  </label>
                </div>
                <RegistrationChart
                  data={monthSeries}
                  hasRegistrationDates={hasRegistrationDates}
                />
              </section>

              <div className={styles.lowerGrid}>
                <section
                  className={`${styles.panel} ${styles.activityPanel}`}
                  id="activity"
                  aria-labelledby="activity-title"
                >
                  <div className={styles.panelHeading}>
                    <h2 id="activity-title">Aktivitas Terbaru</h2>
                    {applicants.length > 6 && !normalizedSearch && (
                      <button
                        className={styles.viewAll}
                        type="button"
                        onClick={() => setShowAll((showing) => !showing)}
                      >
                        {showAll ? "Lihat Sedikit" : "Lihat Semua"} <span>→</span>
                      </button>
                    )}
                  </div>
                  <div className={styles.tableScroll}>
                    <table className={styles.activityTable}>
                      <thead>
                        <tr>
                          <th>Waktu</th>
                          <th>Nama Calon Siswa</th>
                          <th>Aktivitas</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleApplicants.map((applicant) => (
                          <tr key={applicant.id}>
                            <td>{formatTime(applicant.createdAt)}</td>
                            <td>
                              <span className={styles.student}>
                                <span className={styles.studentAvatar}>
                                  {initials(applicant.nama)}
                                </span>
                                <span>{applicant.nama}</span>
                              </span>
                            </td>
                            <td>Akun didaftarkan</td>
                            <td>
                              <span className={styles.registeredStatus}>
                                Terdaftar
                              </span>
                            </td>
                          </tr>
                        ))}
                        {visibleApplicants.length === 0 && (
                          <tr>
                            <td className={styles.emptyRow} colSpan="4">
                              {normalizedSearch
                                ? "Tidak ada calon siswa yang cocok dengan pencarian."
                                : "Belum ada calon siswa yang terdaftar."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className={`${styles.panel} ${styles.majorPanel}`}>
                  <div className={styles.panelHeading}>
                    <h2>
                      <Image
                        src="/icons/dashboard-stats.svg"
                        alt=""
                        width={16.25}
                        height={16.25}
                        unoptimized
                      />
                      Statistik Jurusan
                    </h2>
                  </div>
                  <div className={styles.majorEmpty}>
                    {majorTotals.length ? (
                      <div className={styles.majorList}>
                        {majorTotals.map((item) => (
                          <div className={styles.majorRow} key={item.major}>
                            <span>{item.major}</span>
                            <strong>{item.total}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Belum ada data jurusan pada akun pendaftar.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <aside className={styles.rail} aria-label="Informasi sekolah">
              <article className={styles.schoolCard}>
                <Image
                  src="/assets/dashboard-school-poster.jpeg"
                  alt="Poster SMK Citra Negara"
                  fill
                  sizes="(max-width: 900px) 100vw, 380px"
                  className={styles.schoolPoster}
                />
                <div className={styles.schoolCaption}>
                  “Pilihan Yang Tepat
                  <br />
                  di Sekolah Yang M.A.N.T.A.P”
                </div>
              </article>
              <article className={styles.quoteCard}>
                <Image
                  src="/icons/dashboard-quote-mark.svg"
                  alt=""
                  width={13.4993}
                  height={12.9159}
                  unoptimized
                />
                <p>
                  Pendidikan adalah investasi terbaik untuk masa depan bangsa.
                </p>
                <span aria-hidden="true" />
              </article>
            </aside>
          </div>
            </>
          ) : (
            <AdminModules section={activeSection} search={search} />
          )}
        </div>
      </main>
    </div>
  );
}
