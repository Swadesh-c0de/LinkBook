import { NextRequest, NextResponse } from 'next/server';

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { path } = await params;
  return handleRequest(request, path);
}

export async function POST(request: NextRequest, { params }: Props) {
  const { path } = await params;
  return handleRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: Props) {
  const { path } = await params;
  return handleRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { path } = await params;
  return handleRequest(request, path);
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { path } = await params;
  return handleRequest(request, path);
}

async function handleRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  
  let backendBaseUrl = process.env.BACKEND_API_URL || 'https://contacts-management-system-backend.vercel.app/api';
  if (backendBaseUrl.startsWith('http://') && backendBaseUrl.includes('vercel.app')) {
    backendBaseUrl = backendBaseUrl.replace('http://', 'https://');
  }
  const url = `${backendBaseUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers(request.headers);
  headers.delete('host'); 
  if (['GET', 'HEAD'].includes(request.method)) {
    headers.delete('content-length');
  }

  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    const isNullBodyStatus = [101, 204, 205, 304].includes(response.status);
    const responseData = isNullBodyStatus ? null : await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    // Security headers
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (!isNullBodyStatus && response.status >= 400 && process.env.NODE_ENV !== 'production' && responseData) {
      try {
        const text = new TextDecoder().decode(responseData);
        console.error(`Backend returned ${response.status}:`, text);
      } catch (e) {
        console.error(`Backend returned ${response.status} (could not decode body)`);
      }
    }

    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    });

    // Ensure all Set-Cookie headers are forwarded cleanly without being merged
    if (typeof (response.headers as any).getSetCookie === 'function') {
      const cookies = (response.headers as any).getSetCookie();
      if (cookies && cookies.length > 0) {
        nextResponse.headers.delete('set-cookie');
        cookies.forEach((c: string) => nextResponse.headers.append('set-cookie', c));
      }
    }

    return nextResponse;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Proxy error:', error);
    }
    return NextResponse.json({ 
      error: 'Proxy error', 
      details: process.env.NODE_ENV !== 'production' ? (error instanceof Error ? error.message : String(error)) : undefined 
    }, { status: 500 });
  }
}
