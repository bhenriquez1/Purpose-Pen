import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-level shared-password gate, separate from and in front of the
 * Firebase auth wall. Defense-in-depth: blocks requests (including API
 * routes) before they ever reach the app, so a misconfigured deployment
 * (e.g. NEXT_PUBLIC_DEV_BYPASS_AUTH left set) is still not publicly reachable.
 * Optional — if SITE_PASSWORD is unset, this middleware no-ops.
 */
const SITE_USERNAME = process.env.SITE_PASSWORD_USERNAME || "purpose-pen";
const SITE_PASSWORD = process.env.SITE_PASSWORD;

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Purpose Pen", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  let user = "";
  let pass = "";
  try {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    user = decoded.slice(0, separatorIndex);
    pass = decoded.slice(separatorIndex + 1);
  } catch {
    return unauthorized();
  }

  if (user !== SITE_USERNAME || pass !== SITE_PASSWORD) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
};
