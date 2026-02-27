import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect root to dashboard if has session cookie
    const hasSession =
        request.cookies.has("authjs.session-token") ||
        request.cookies.has("__Secure-authjs.session-token");

    // Public routes
    const publicRoutes = ["/", "/login", "/register", "/api/auth", "/api/register"];
    const isPublic = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Static assets and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/uploads") ||
        pathname.includes(".") ||
        isPublic
    ) {
        return NextResponse.next();
    }

    // Protected routes — redirect to login if no session
    if (!hasSession) {
        // For API routes, return 401 JSON instead of redirecting
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
    ],
};
