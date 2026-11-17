import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Forward to /auth/confirm with all search parameters preserved
  const confirmUrl = request.nextUrl.clone();
  confirmUrl.pathname = "/auth/confirm";
  return NextResponse.redirect(confirmUrl);
}
