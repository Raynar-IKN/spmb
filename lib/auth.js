import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const dashboardByRole = {
  calon_siswa: "/dashboard/calon-siswa",
  admin: "/dashboard/admin",
  kepsek: "/dashboard/kepsek",
};

export async function getSession(token) {
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    return payload;
  } catch {
    return null;
  }
}

export async function requireRole(requiredRole) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("spmb_session")?.value);
  const role = session?.role;
  const destination =
    typeof role === "string" && Object.hasOwn(dashboardByRole, role)
      ? dashboardByRole[role]
      : undefined;

  if (!session || typeof session.sub !== "string" || !destination) {
    redirect("/login");
  }

  if (role !== requiredRole) {
    redirect(destination);
  }

  return session;
}