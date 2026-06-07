import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip API routes, Next internals and static assets so the proxy doesn't
    // intercept auth handlers or static file delivery.
    if (
        // Allow auth pages and assets to bypass the proxy to avoid redirect loops
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname.startsWith('/auth') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};