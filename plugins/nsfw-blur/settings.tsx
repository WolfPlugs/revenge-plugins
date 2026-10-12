import Page from '@revenge-mod/components/Page'
import { Design } from '@revenge-mod/discord/design'
import { ScrollView } from 'react-native'
import type { PluginSettingsComponent } from '@revenge-mod/plugins/types'
import type { ComponentProps } from 'react'
import type { Settings } from './index'

type Props = ComponentProps<PluginSettingsComponent<{ jsonStorage: Settings }>>

export default function SettingsComponent({ api: { jsonStorage } }: Props) {
	const settings = jsonStorage.use()
	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{ paddingBottom: 24 }}
		>
			<Page>
				<Design.TableRowGroup title="NSFW Blur">
					<Design.TableSwitchRow
						label="Blur media in all channels"
						value={settings?.allChannels ?? false}
						onValueChange={allChannels => jsonStorage.set({ allChannels })}
					/>
					<Design.TableRow
						label="Blur strength"
						trailing={
							<Design.TableRow.TrailingText
								text={String(settings?.strength ?? 24)}
							/>
						}
						subLabel={
							<Design.Slider
								value={settings?.strength ?? 24}
								minimumValue={1}
								maximumValue={25}
								step={1}
								onValueChange={strength => jsonStorage.set({ strength })}
							/>
						}
					/>
				</Design.TableRowGroup>
			</Page>
		</ScrollView>
	)
}
