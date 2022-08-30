import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	const url = request.nextUrl;
	if (url.pathname.startsWith('/_next')) {
		return;
	}

	url.pathname = '/api/proxy';
	return NextResponse.rewrite(url);
}
