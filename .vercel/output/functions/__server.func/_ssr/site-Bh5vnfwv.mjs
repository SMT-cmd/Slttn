//#region node_modules/.nitro/vite/services/ssr/assets/site-Bh5vnfwv.js
var SITE = {
	name: "SLT Trade Hub",
	library: "The Trading Library",
	tagline: "Trading books and education for synthetic indices traders",
	headline: "Trading books and education for synthetic indices traders.",
	domain: "slttradehub.online",
	libraryHost: "library.slttradehub.online",
	email: "hello@slttradehub.online",
	author: "O.J. Alonge",
	authorRole: "Synthetic Indices Specialist",
	telegram: "https://t.me/slttradehub",
	whatsapp: "https://chat.whatsapp.com/slttradehub",
	url: "https://slttradehub.online",
	libraryUrl: "https://library.slttradehub.online",
	marketingTitle: "Synthetic Indices Trading Books, Education, and Community | SLT Trade Hub",
	marketingDescription: "SLT Trade Hub helps synthetic indices traders study Volatility, Boom & Crash, Step, Jump, and Range markets with practical trading books, secure online reading, and a focused community.",
	libraryTitle: "Synthetic Indices Trading Book Library | The Trading Library",
	libraryDescription: "Browse The Trading Library for synthetic indices trading books on Volatility, Boom & Crash, Step, Jump, and Range, with secure online reading, clear pricing, and member access options.",
	ogImagePath: "/og.png",
	ogImageAlt: "SLT Trade Hub share card for synthetic indices trading books and education"
};
function bookPageTitle(title, subtitle) {
	return `${title}${subtitle?.trim() ? `: ${subtitle.trim()}` : ""} | ${SITE.library}`;
}
function bookPageDescription(description) {
	const summary = description?.trim();
	return summary && summary.length > 40 ? summary : SITE.libraryDescription;
}
var PRICING = {
	downloadPrelaunch: 69,
	downloadPublic: 99,
	taggedCouponPublic: 5,
	subQuarterly: 12.99,
	subBiannual: 22.99,
	online: {
		short: 19,
		medium: 29,
		full: 39
	}
};
//#endregion
export { bookPageTitle as i, SITE as n, bookPageDescription as r, PRICING as t };
