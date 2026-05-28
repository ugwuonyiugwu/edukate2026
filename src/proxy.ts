import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Group your routes logically
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/quizathon(.*)', 
  '/libraries(.*)',
]);

const isWebhookRoute = createRouteMatcher(['/api/users/webhook(.*)']);
const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 2. Bypass all restrictions for the webhook processing stream immediately
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  // 3. Enforce standard Clerk route protection
  if (isProtectedRoute(req)) {
    if (!userId) {
      // Force them to sign in if accessing protected app routes without a session
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  // 4. Redirect logged-in and authenticated healthy users away from landing/auth views
  if (userId && (isAuthPage(req) || req.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};