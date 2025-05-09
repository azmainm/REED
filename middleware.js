import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  console.log('Initializing Firebase Admin with config:', {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Don't log the private key for security
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  });
  
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// List of public paths that don't require authentication
const publicPaths = ['/', '/login', '/signup']

export async function middleware(request) {
  console.log('Middleware running for path:', request.nextUrl.pathname);
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    console.log('Public path, allowing access');
    return NextResponse.next()
  }

  // Get the session token from the cookie
  const sessionCookie = request.cookies.get('session')?.value
  console.log('Session cookie exists:', !!sessionCookie);

  try {
    if (!sessionCookie) {
      console.log('No session cookie found');
      throw new Error('No session cookie')
    }

    // Verify the session cookie
    await getAuth().verifySessionCookie(sessionCookie, true)
    console.log('Session cookie verified successfully');
    
    // User is authenticated, allow access
    return NextResponse.next()
  } catch (error) {
    console.log('Authentication error:', error.message);
    // User is not authenticated, redirect to home page
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}
