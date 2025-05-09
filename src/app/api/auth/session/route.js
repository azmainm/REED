import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function POST(request) {
  try {
    const { idToken } = await request.json()
    console.log('Creating session cookie for token')
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn })
    console.log('Session cookie created successfully')
    
    // Set cookie options
    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    }
    
    console.log('Setting cookie with options:', options)
    
    // Return the response with the session cookie
    return NextResponse.json(
      { status: 'success' },
      {
        headers: {
          'Set-Cookie': `session=${sessionCookie}; ${Object.entries(options)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ')}`,
        },
      }
    )
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  return NextResponse.json(
    { status: 'success' },
    {
      headers: {
        'Set-Cookie': 'session=; Max-Age=0; Path=/; HttpOnly',
      },
    }
  )
}
