import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS middleware — allows the admin.html and customer.html files
 * (opened from file:// or packaged as Android APK) to call the API.
 *
 * Without this, browsers block cross-origin requests from file:// origins.
 */
export function middleware(request: NextRequest) {
  // Handle CORS preflight (OPTIONS) — must respond with 200 + CORS headers
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  // For all other requests, add CORS headers to the response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  return response;
}

export const config = {
  // Only apply to /api/* routes (don't add CORS to static pages)
  matcher: '/api/:path*',
};
