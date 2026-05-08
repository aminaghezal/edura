import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getSession() reads from cookie — no network call, fast
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // Protect /app — redirect unauthenticated users to /login
  if (req.nextUrl.pathname.startsWith("/app") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from auth pages and landing
  if (
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/signup" ||
      req.nextUrl.pathname === "/") &&
    user
  ) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/app/:path*", "/login", "/signup"],
};
