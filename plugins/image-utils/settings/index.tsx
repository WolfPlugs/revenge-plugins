import Page from '@revenge-mod/components/Page'
import { Design } from '@revenge-mod/discord/design'
import { ScrollView } from 'react-native'
import { doubleTapZoom } from './config'
import type { PluginSettingsComponent } from '@revenge-mod/plugins/types'
import type { ComponentProps } from 'react'
import type { Settings } from './config'

type Props = ComponentProps<PluginSettingsComponent<{ jsonStorage: Settings }>>

export default function SettingsComponent({ api: { jsonStorage } }: Props) {
	const value = doubleTapZoom(jsonStorage.use())
	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{ paddingBottom: 24 }}
		>
			<Page>
				<Design.TableRowGroup title="ImageUtils">
					<Design.TableRow
						label="Double-tap zoom"
						trailing={<Design.TableRow.TrailingText text={`${value}×`} />}
						subLabel={
							<Design.Slider
								value={value}
								minimumValue={2}
								maximumValue={10}
								step={1}
								onValueChange={doubleTapZoom =>
									jsonStorage.set({ doubleTapZoom })
								}
							/>
						}
					/>
				</Design.TableRowGroup>
			</Page>
		</ScrollView>
	)
}
