import type { NextRequest } from 'next/server';

export const config = {
	runtime: 'experimental-edge',
};

export default async function handler(req: NextRequest) {
	let responseHeader: any = [];
	let requestHeader: any = [];
	let requestModifiedHeader: any = [];
	let responseModifiedHeader: any = [];

	req.headers.forEach((value, key) => {
		if (!key.startsWith('x-')) {
			requestHeader.push({ [key]: value });
		}
	});

	console.log('requestHeadwer', req.nextUrl.href, requestHeader);

	const host = req.headers.get('host');

	requestHeader.map((item: any) => {
		req.headers.set(
			Object.keys(item)[0],
			item[Object.keys(item)[0]]
				.replaceAll(host, 'www.visitvictoria.com')
				.replaceAll('.vercel.app', '.visitvictoria.com')
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
	//console.log("response header--->")

	response.headers.forEach((value, key) => {
		responseHeader.push({ [key]: value });
	});

	console.log('responseHeader', responseHeader);

	const myHeaders = new Headers();

	responseHeader.forEach((item: any) => {
		myHeaders.set(
			Object.keys(item)[0],
			item[Object.keys(item)[0]]
				.replaceAll('www.visitvictoria.com', host)
				.replaceAll('.visitvictoria.com', '.vercel.app')
		);
	});

	myHeaders.forEach((value, key) => {
		responseModifiedHeader.push({ [key]: value });
	});

	console.log('responseHeaderModified', responseModifiedHeader);

	if (
		!!response.headers.get('content-type') &&
		!['html', 'css', 'javascript'].some((type) =>
			response.headers.get('content-type')?.includes(type)
		)
	) {
		return response;
	}

	const text = await response.text();
	const modifiedtext = text.replaceAll(
		process.env.REWRITE_HOST as any,
		req.nextUrl.origin
	);
	// const { headers } = response
	// console.log("response headers", headers)
	return new Response(modifiedtext, { headers: myHeaders });
}
