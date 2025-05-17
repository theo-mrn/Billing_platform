import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token) {
      // Pas connecté => Redirige vers ta page 403
      return NextResponse.redirect(new URL('/403', req.url));
    }

    // Si connecté, continue normalement
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Toujours autoriser, on gère la logique nous-même
    },
  }
);

export const config = {
  matcher: ['/projects/:path*'],
};