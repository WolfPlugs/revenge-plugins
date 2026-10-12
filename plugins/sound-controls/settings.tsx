import Page from '@revenge-mod/components/Page'
import { Design } from '@revenge-mod/discord/design'
import { useEffect } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { canPreview, playPreview, stopPreview } from './preview'
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
						<Design.TableSwitchRow
							key={group}
							label={`Disable ${label.toLowerCase()} sound`}
							value={settings.muted[group as keyof typeof SoundGroups] ?? false}
							onValueChange={disabled =>
								jsonStorage.set({ muted: { [group]: disabled } })
							}
							subLabel={
								<View
									style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
								>
									{names.map((name, index) =>
										canPreview(name) ? (
											<Design.Text
												key={name}
												variant="text-sm/normal"
												color="text-link"
												accessibilityRole="button"
												accessibilityLabel={`Preview ${label.toLowerCase()}${names.length > 1 ? ` ${index + 1}` : ''}`}
												onPress={event => {
													event.stopPropagation()
													void playPreview(name).catch(error =>
														Alert.alert(
															'Sound preview',
															error instanceof Error
																? error.message
																: 'Unable to play this sound.',
														),
													)
												}}
											>
												{names.length > 1
													? `Preview ${index + 1}`
													: 'Preview Sound'}
											</Design.Text>
										) : (
											<Design.Text key={name} variant="text-sm/normal">
												Preview is unavaiable
											</Design.Text>
										),
									)}
								</View>
							}
						/>
					))}
				</Design.TableRowGroup>
			</Page>
		</ScrollView>
	)
}
