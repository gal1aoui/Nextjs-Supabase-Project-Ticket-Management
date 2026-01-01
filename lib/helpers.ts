import { randomInt } from "node:crypto";
import type { JwtPayload } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { routes } from "@/app/routes";

function handleUnauthenticatedUserRedirect(
  user: JwtPayload | undefined,
  isProtectedRoute: boolean,
  request: NextRequest
): NextResponse | null {
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL(routes.auth.login, request.url));
  }
  return null;
}

function handleAuthenticatedUserRedirect(
  user: JwtPayload | undefined,
  isAuthRoute: boolean,
  isVerifiedUser: boolean,
  pathname: string,
  request: NextRequest
): NextResponse | null {
  if (user && isAuthRoute) {
    const destinationUrl = isVerifiedUser ? routes.dashboard.home : routes.auth.otpVerification;

    if (pathname !== destinationUrl) {
      return NextResponse.redirect(new URL(destinationUrl, request.url));
    }
  }
  return null;
}

function handleUnverifiedUserRedirect(
  user: JwtPayload | undefined,
  isUnverifiedUser: boolean,
  pathname: string,
  request: NextRequest
): NextResponse | null {
  if (user && isUnverifiedUser && pathname !== routes.auth.otpVerification) {
    if (!pathname.startsWith("/_next/") && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL(routes.auth.otpVerification, request.url));
    }
  }
  return null;
}

const generateOtpCode = () => {
  return String(randomInt(100000, 999999));
};

const dateFormatter = (dateTime: string, isShort?: boolean) => {
  const options = {
    year: "numeric",
    month: isShort ? "short" : "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  } as const;
  return new Date(dateTime).toLocaleString("en-US", options);
};

const getUserInitials = (name: string | null) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export {
  handleUnauthenticatedUserRedirect,
  handleAuthenticatedUserRedirect,
  handleUnverifiedUserRedirect,
  generateOtpCode,
  dateFormatter,
  getUserInitials,
};
