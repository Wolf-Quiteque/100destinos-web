import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/perfil', '/viagens', '/meus-bilhetes']; // Add other routes that need authentication
const authRoutes = ['/login', '/signup'];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // If user is not logged in and trying to access a protected route
  if (!session && protectedRoutes.some(path => pathname.startsWith(path))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // Optional: Add redirect query param if needed: redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access login or signup page
  if (session && authRoutes.some(path => pathname.startsWith(path))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/perfil'; // Redirect logged-in users away from auth pages
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/auth (Supabase auth routes) - IMPORTANT: Exclude Supabase callback routes
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    // Explicitly include root paths for protected/auth routes if needed,
    // but the pattern above should cover them unless they have extensions.
    '/',
    '/perfil/:path*',
    '/viagens/:path*',
    '/meus-bilhetes/:path*',
    '/login',
    '/signup',
    '/bilhetes/:path*', // Keep matcher for bilhetes/pagamento if MobileAppBar logic depends on it
    '/pagamento/:path*',
  ],
};
