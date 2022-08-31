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
			requestHeader.push([key, value]);
		}
	});

	console.log('requestHeader', req.nextUrl.href, requestHeader);

	// set request headers
	requestHeader.map((item: any) => {
		req.headers.set(
			item[0],
			item[1]
				.replaceAll(host, 'www.countryroad.com.au')
				.replaceAll('.akqa.net.au', '.countryroad.com.au')
		);
	});

	req.headers.forEach((value, key) => {
		if (!key.startsWith('x-')) {
			requestModifiedHeader.push([key, value]);
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
		responseHeader.push([key, value]);
	});

	console.log('responseHeader', responseHeader);

	// set the response headers

	const myHeaders = new Headers();
	responseHeader.forEach((item: any) => {
		if (item[0] === 'set-cookie') {
			const cookies = item[1].split('countryroad.com.au,');
			myHeaders.append(
				'Set-Cookie',
				`${cookies[0]}akqa.net.au`.replaceAll(
					'.countryroad.com.au',
					'.akqa.net.au'
				)
			);
			myHeaders.append(
				'Set-Cookie',
				`${cookies[1]}akqa.net.au`.replaceAll(
					'.countryroad.com.au',
					'.akqa.net.au'
				)
			);
		} else {
			myHeaders.set(
				item[0],
				item[1]
					.replaceAll('www.countryroad.com.au', host)
					.replaceAll('.countryroad.com.au', '.akqa.net.au')
			);
		}
	});

	myHeaders.forEach((value, key) => {
		responseModifiedHeader.push([key, value]);
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

	return new Response(modifiedtext, { headers: myHeaders });
}
