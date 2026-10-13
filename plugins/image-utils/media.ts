export type ImageSource = { uri: string; searchUri: string }

export function readImageSource(value: unknown): ImageSource | undefined {
	if (Array.isArray(value)) value = value[0]
	if (
		typeof value !== 'object' ||
		value === null ||
		!('uri' in value) ||
		typeof value.uri !== 'string'
	)
		return
	if ('videoURI' in value && value.videoURI) return
	if (
		'contentType' in value &&
		typeof value.contentType === 'string' &&
		value.contentType.length > 0 &&
		!value.contentType.startsWith('image/')
	)
		return
	if (!/^https?:\/\//i.test(value.uri)) return
	const searchUri =
		'sourceURI' in value &&
		typeof value.sourceURI === 'string' &&
		/^https?:\/\//i.test(value.sourceURI)
			? value.sourceURI
			: value.uri
	return { uri: value.uri, searchUri }
}

export const searchEngines = {
	'Google Lens': 'https://lens.google.com/uploadbyurl?url=',
	Yandex: 'https://yandex.com/images/search?rpt=imageview&url=',
	SauceNAO: 'https://saucenao.com/search.php?url=',
	IQDB: 'https://iqdb.org/?url=',
	Bing: 'https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:',
	TinEye: 'https://www.tineye.com/search?url=',
	ImgOps: 'https://imgops.com/start?url=',
}
