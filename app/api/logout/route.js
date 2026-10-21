export async function POST() {
  const cookie = [
    "spmb_session=",
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (process.env.NODE_ENV === "production") {
    cookie.push("Secure");
  }

  return Response.json(
    { message: "Logout berhasil." },
    {
      headers: {
        "Set-Cookie": cookie.join("; "),
      },
    }
  );
}
