import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") || "/dashboard/buyer";

  // Sanitize redirect to prevent open redirects
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/dashboard/buyer";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");
  redirectTo.searchParams.delete("code");

  const supabase = createClient();

  // 1. Verify OTP using token_hash (standard Supabase hash confirmation flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }

    const loginErrorUrl = request.nextUrl.clone();
    loginErrorUrl.pathname = "/login";
    loginErrorUrl.searchParams.set("error", error.message || "Invalid or expired confirmation link.");
    return NextResponse.redirect(loginErrorUrl);
  }

  // 2. Exchange code for session (standard PKCE email callback flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }

    const loginErrorUrl = request.nextUrl.clone();
    loginErrorUrl.pathname = "/login";
    loginErrorUrl.searchParams.set("error", error.message || "Invalid or expired authorization code.");
    return NextResponse.redirect(loginErrorUrl);
  }

  // 3. Fallback: No token or code provided
  const loginErrorUrl = request.nextUrl.clone();
  loginErrorUrl.pathname = "/login";
  loginErrorUrl.searchParams.set("error", "No verification token provided in URL.");
  return NextResponse.redirect(loginErrorUrl);
}
