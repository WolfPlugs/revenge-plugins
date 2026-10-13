import { getModules } from '@revenge-mod/modules/finders'
import { withProps } from '@revenge-mod/modules/finders/filters'
import { instead } from '@revenge-mod/patcher'
import { isValidElement } from 'react'
import { patchAttachmentMenu } from './attachment-menu'
import { readImageSource } from './media'
import RotationSurface, { resetRotations } from './rotation-surface'
import SearchImageIcon from './search-icon'
import { closeSheets, openSearch } from './sheets'
import { patchViewerLongPress } from './viewer-menu'
import { patchZoomLimit } from './zoom'
import type { PluginOptions } from '@revenge-mod/plugins/types'
import type { ReactNode } from 'react'

export default {
	start({ cleanup, plugin }) {
		const reportError = (error: unknown) => plugin.reportError(error)
		cleanup(resetRotations)
		cleanup(closeSheets)
		patchAttachmentMenu(cleanup, reportError)
		patchViewerLongPress(cleanup, reportError)
		patchZoomLimit(cleanup)
		cleanup(
			getModules(
				withProps<{
					useMediaShareActions: (...args: unknown[]) => unknown
				}>('useMediaShareActions'),
				module => {
					cleanup(
						instead(module, 'useMediaShareActions', function (args, original) {
							const actions = Reflect.apply(original, this, args)
							const props = args[0]
							if (
								!Array.isArray(actions) ||
								typeof props !== 'object' ||
								props === null ||
								!('source' in props)
							)
								return actions
							const source = readImageSource(props.source)
							if (!source) return actions
							return [
								...actions,
								{
									label: 'Search image',
									IconComponent: SearchImageIcon,
									action: () => openSearch(source.searchUri, reportError),
								},
							]
						}),
					)
				},
				{ max: 1 },
			),
		)
		cleanup(
			getModules(
				withProps<{
					MediaViewerItem: { type: (...args: unknown[]) => unknown }
				}>('MediaViewerItem'),
				module => {
					const item = module.MediaViewerItem
					if (
						typeof item !== 'object' ||
						item === null ||
						typeof item.type !== 'function'
					) {
						reportError(
							new Error('ImageUtils: unsupported MediaViewerItem export.'),
						)
						return
					}
					cleanup(
						instead(item, 'type', function (args, original) {
							const viewer = Reflect.apply(original, this, args)
							const props = args[0]
							if (
								typeof props !== 'object' ||
								props === null ||
								!('source' in props)
							)
								return viewer
							const source = readImageSource(props.source)
							if (!source || !isValidElement<{ children?: ReactNode }>(viewer))
								return viewer
							return <RotationSurface key={source.uri} viewer={viewer} />
						}),
					)
				},
				{ max: 1 },
			),
		)
	},
} satisfies PluginOptions
