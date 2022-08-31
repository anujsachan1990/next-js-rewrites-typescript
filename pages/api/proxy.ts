import type { NextRequest } from 'next/server';

export const config = {
	runtime: 'experimental-edge',
};

export default async function handler(req: NextRequest) {
	let responseHeader: any = [],
		requestHeader: any = [],
		requestModifiedHeader: any = [],
		responseModifiedHeader: any = [];

	const host = req.headers.get('host');

	// extract the request headers
	req.headers.forEach((value, key) => {
		if (!key.startsWith('x-')) {
			requestHeader.push({ [key]: value });
		}
	});

	console.log('requestHeader', req.nextUrl.href, requestHeader);


	// set request headers
	requestHeader.map((item: any) => {
		req.headers.set(
			Object.keys(item)[0],
			item[Object.keys(item)[0]]
				.replaceAll(host, 'www.countryroad.com.au')
				.replaceAll('.vercel.app', '.countryroad.com.au')
		);
	});

	req.headers.forEach((value, key) => {
		if (!key.startsWith('x-')) {
			requestModifiedHeader.push({ [key]: value });
		}
	});
	const newUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`
		.replaceAll('(', '%28')
		.replaceAll(')', '%29')
		.replaceAll('%2A', '%2a')
		.replaceAll('%2B', '%2b')
		.replaceAll('%2C', '%2c')
		.replaceAll('%2D', '%2d')
		.replaceAll('%2E', '%2e')
		.replaceAll('%2F', '%2f');

	console.log(
		'requestModifiedHeader',
		req.nextUrl.href,
		newUrl,
		requestModifiedHeader
	);

	const response = await fetch(`${process.env.REWRITE_HOST}${newUrl}`, {
		method: req.method,
	});

	// extract the response headers
	response.headers.forEach((value, key) => {
		responseHeader.push({ [key]: value });
	});

	console.log('responseHeader', responseHeader);

	// set the response headers

	const myHeaders = new Headers();
	responseHeader.forEach((item: any) => {
		myHeaders.set(
			Object.keys(item)[0],
			item[Object.keys(item)[0]]
				.replaceAll('www.countryroad.com.au', host)
				.replaceAll('.countryroad.com.au', '.vercel.app')
		);
	});

	myHeaders.forEach((value, key) => {
		responseModifiedHeader.push({ [key]: value });
	});

	console.log('responseHeaderModified', responseModifiedHeader);



	// return response if content type is not html,css,js
	if (
		!['html', 'css', 'javascript'].some((type) =>
			response.headers.get('content-type')?.includes(type)
		)
	) {
		return response;
	}

	const text = await response.text();
	const modifiedtext = text.replaceAll(
		process.env.REWRITE_HOST as string,
		req.nextUrl.origin
	);
//
	const testHeader = [
		[ 'Set-Cookie','visid_incap_2179657=q9QTXcylTKK1qVdQ49e+hmmlDmMAAAAAQUIPAAAAAADArl70DbTH9/2SFJJUaEOg; expires=Wed, 30 Aug 2023 11:57:09 GMT; HttpOnly; path=/; Domain=next-js-rewrites-typescript-anuj.vercel.app'],
		[ 'Set-Cookie','incap_ses_605_2179657=d56IDrgvPxDDqcdVCmVlCGmlDmMAAAAAnDjmzaeVoRolZRzsVNha7g==; path=/; Domain=next-js-rewrites-typescript-anuj.vercel.app'],
		['content-type', 'text/html; charset=utf-8'],
	];

	return new Response(modifiedtext, { headers: new Headers(testHeader as any)});
}
