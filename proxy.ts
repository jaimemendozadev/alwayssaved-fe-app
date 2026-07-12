import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// See Dev Notes below.
const isPublicRoute = createRouteMatcher([
  '/(.*)',
  '/signin(.*)',
  '/signup(.*)',
  '/api/webhooks/stripe',
  '/seed(.*)',
  '/api/health'
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

/***************************
 * Notes
 ***************************

 1) Temporarily adding /seed route to publicRoute to access
    route during development. Will need to fix this with 
    .env file based on running Node environment.

 2) Made Stripe webhooks route public so Stripe API
    can communicate with the Backend & we're able to
    persist Stripe user info in DB.

*/