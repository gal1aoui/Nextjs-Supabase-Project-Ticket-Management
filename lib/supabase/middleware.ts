import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { routes } from "@/app/routes";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.map(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.map(({ name, value }) => supabaseResponse.cookies.set(name, value));
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Don't remove getClaims()
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = Object.values(routes.auth).includes(pathname);
  const isProtectedRoute = !isAuthRoute || pathname === routes.auth.otpVerification;

  const isVerifiedUser = user && user.user_metadata?.verified_code === "confirmed";
  const isUnverifiedUser = user && user.user_metadata?.verified_code !== "confirmed";

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL(routes.auth.login, request.url));
  }

  if (user && isAuthRoute) {
    const destinationUrl = isVerifiedUser ? routes.dashboard.home : routes.auth.otpVerification;

    console.log(`User logged in, redirecting from auth page to: ${destinationUrl}`);
    return NextResponse.redirect(new URL(destinationUrl, request.url));
  }

  if (user && isUnverifiedUser && pathname !== routes.auth.otpVerification) {
    if (!pathname.startsWith("/_next/") && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL(routes.auth.otpVerification, request.url));
    }
  }

  return supabaseResponse;
}
