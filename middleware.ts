import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/me")) {
    const lid = request.cookies.get("lid");
    const tid = request.cookies.get("tid");
    const mInfo = request.cookies.get("m_info");
    const hasLogin = lid && tid && mInfo;
    if (hasLogin) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/me/:path*"],
};
