import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define only the routes that REQUIRE authentication
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 2. Protect only the specific routes defined above
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 3. Optional: If a user is already logged in and hits the sign-in/up pages,
  // you might still want to redirect them to the dashboard.
  const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
  if (userId && isAuthPage(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};