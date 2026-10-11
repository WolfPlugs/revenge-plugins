import Page from '@revenge-mod/components/Page'
import { Design } from '@revenge-mod/discord/design'
import { ScrollView } from 'react-native'
import { DefaultSettings, SoundGroups } from './sounds'
import type { PluginSettingsComponent } from '@revenge-mod/plugins/types'
import type { ComponentProps } from 'react'
import type { Settings } from './sounds'

type Props = ComponentProps<PluginSettingsComponent<{ jsonStorage: Settings }>>

export default function SettingsComponent({ api: { jsonStorage } }: Props) {
	const settings = jsonStorage.use() ?? DefaultSettings
	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{ paddingBottom: 24 }}
		>
			<Page>
				<Design.TableRowGroup title="Mute sounds">
					{Object.entries(SoundGroups).map(([group, { label }]) => (
						<Design.TableSwitchRow
							key={group}
							label={label}
							value={settings.muted[group as keyof typeof SoundGroups] ?? false}
							onValueChange={enabled =>
								jsonStorage.set({ muted: { [group]: enabled } })
							}
						/>
					))}
				</Design.TableRowGroup>
			</Page>
		</ScrollView>
	)
}
