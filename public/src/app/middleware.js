import { NextResponse } from 'next/server';

// ── Public paths — no auth required ──────────────────────────────────────────
const publicPaths = [
  '/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/EmployeeLogin',
];

// ── Auth paths — redirect AWAY if already logged in ──────────────────────────
const authOnlyPaths = [
  '/login',
  '/auth/EmployeeLogin',
  '/auth/signup',
  '/auth/forgot-password',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── 1. Always allow static/api/public assets ──────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // ── 2. Get auth cookie ────────────────────────────────────────────────────
  const userCookie = request.cookies.get('auth_user');

  let user = null;
  if (userCookie?.value) {
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      user = null;
    }
  }

  const role = user?.role;
  const isLoggedIn = !!user;

  // ── 3. If user is already logged in and visits a login/auth page ──────────
  //       → send them to their dashboard (not always /Admin/Dashboard)
  if (isLoggedIn && authOnlyPaths.some(p => pathname.startsWith(p))) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/Admin/Dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/Employee/Dashboard', request.url));
    }
  }

  // ── 4. Allow public paths without auth ───────────────────────────────────
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── 5. Not logged in → redirect to login ─────────────────────────────────
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── 6. Role-based access control ─────────────────────────────────────────
  //       ✅ DO NOT redirect to dashboard — just redirect to correct section
  //       This preserves the current page on refresh

  if (pathname.startsWith('/Admin') && role !== 'admin') {
    // Employee trying to access Admin → go to Employee dashboard
    return NextResponse.redirect(new URL('/Employee/Dashboard', request.url));
  }

  if (pathname.startsWith('/Employee') && role !== 'employee') {
    // Admin trying to access Employee → go to Admin dashboard
    return NextResponse.redirect(new URL('/Admin/Dashboard', request.url));
  }

  // ── 7. All good — stay on current page ✅ ─────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};