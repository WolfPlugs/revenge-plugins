import { Design } from '@revenge-mod/discord/design'
import { getModules } from '@revenge-mod/modules/finders'
import { withName } from '@revenge-mod/modules/finders/filters'
import { instead } from '@revenge-mod/patcher'
import { Children, cloneElement, isValidElement } from 'react'
import { readImageSource } from './media'
import SearchImageIcon from './search-icon'
import { openSearch } from './sheets'
import type { ReactNode } from 'react'

export function patchViewerLongPress(
	cleanup: (callback: () => void) => void,
	reportError: (error: unknown) => void,
) {
	cleanup(
		getModules(
			withName<(...args: unknown[]) => unknown>('MediaShareActionSheet'),
			module => {
				if (!('default' in module) || typeof module.default !== 'function')
					return
				cleanup(
					instead(module, 'default', function (args, original) {
						const result = Reflect.apply(original, this, args)
						const props = args[0]
						if (
							typeof props !== 'object' ||
							props === null ||
							!('source' in props)
						)
							return result
						const image = readImageSource(props.source)
						if (!image || !isValidElement<{ children?: ReactNode }>(result))
							return result
						const group = result.props.children
						if (!isValidElement<{ children?: ReactNode }>(group)) return result
						if (
							Children.toArray(group.props.children).some(
								row =>
									isValidElement<{ label?: string }>(row) &&
									row.props.label === 'Search image',
							)
						)
							return result
						return cloneElement(
							result,
							{},
							cloneElement(
								group,
								{},
								group.props.children,
								<Design.ActionSheetRow
									key="image-utils-search"
									label="Search image"
									icon={
										<Design.ActionSheetRow.Icon
											IconComponent={SearchImageIcon}
										/>
									}
									onPress={() => openSearch(image.searchUri, reportError)}
								/>,
							),
						)
					}),
				)
			},
			{ returnNamespace: true, max: Infinity },
		),
	)
}
