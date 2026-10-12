import Page from '@revenge-mod/components/Page'
import { Design } from '@revenge-mod/discord/design'
import { Fragment, useEffect } from 'react'
import { Alert, ScrollView } from 'react-native'
import { playPreview, stopPreview } from './preview'
import { DefaultSettings, SoundGroups } from './sounds'
import type { PluginSettingsComponent } from '@revenge-mod/plugins/types'
import type { ComponentProps } from 'react'
import type { Settings } from './sounds'

type Props = ComponentProps<PluginSettingsComponent<{ jsonStorage: Settings }>>

export default function SettingsComponent({ api: { jsonStorage } }: Props) {
	useEffect(() => stopPreview, [])
	const settings = jsonStorage.use() ?? DefaultSettings
	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={{ paddingBottom: 24 }}
		>
			<Page>
				<Design.TableRowGroup>
					{Object.entries(SoundGroups).map(([group, { label, names }]) => (
						<Fragment key={group}>
							<Design.TableSwitchRow
								label={`Disable ${label.toLowerCase()} sound`}
								value={
									settings.muted[group as keyof typeof SoundGroups] ?? false
								}
								onValueChange={disabled =>
									jsonStorage.set({ muted: { [group]: disabled } })
								}
							/>
							{names.map((name, index) => (
								<Design.TableRow
									key={name}
									label={`Preview ${label.toLowerCase()}${names.length > 1 ? ` ${index + 1}` : ''}`}
									trailing={
										<Design.Button
											text="Play"
											size="sm"
											variant="secondary"
											accessibilityLabel={`Preview ${label.toLowerCase()}${names.length > 1 ? ` ${index + 1}` : ''}`}
											onPress={() => {
												void playPreview(name).catch(error =>
													Alert.alert(
														'Sound preview',
														error instanceof Error
															? error.message
															: 'Unable to play this sound.',
													),
												)
											}}
										/>
									}
								/>
							))}
						</Fragment>
					))}
				</Design.TableRowGroup>
			</Page>
		</ScrollView>
	)
}
