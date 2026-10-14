export type Settings = { doubleTapZoom: number }
export const defaultSettings: Settings = { doubleTapZoom: 5 }

export function doubleTapZoom(settings: unknown) {
	const value =
		typeof settings === 'object' &&
		settings !== null &&
		'doubleTapZoom' in settings
			? settings.doubleTapZoom
			: undefined
	return typeof value === 'number' && Number.isFinite(value)
		? Math.max(2, Math.min(10, Math.round(value)))
		: defaultSettings.doubleTapZoom
}
