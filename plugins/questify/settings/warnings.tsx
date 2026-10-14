import {
	AlertActionCreators,
	ToastActionCreators,
} from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { useEffect, useState } from 'react'
import { AppState, Linking, View } from 'react-native'
import { normalizeSettings } from './config'
import {
	completionAllowed,
	displayOnlySettings,
	PolicyUrl,
	SettingWarnings,
	UsageWarning,
	WarningVersion,
} from './warning-policy'
import type { JsonStorage } from '@revenge-mod/json-storage'
import type { Settings } from './config'

const AlertKey = 'questify-usage-warning'
function UsageDialog({
	accept,
	decline,
}: {
	accept: () => Promise<void>
	decline: () => Promise<void>
}) {
	const [step, setStep] = useState(0)
	const [remaining, setRemaining] = useState(10)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	useEffect(() => {
		if (remaining <= 0) return
		const timer = setTimeout(
			() => setRemaining(value => Math.max(0, value - 1)),
			1000,
		)
		return () => clearTimeout(timer)
	}, [remaining])
	async function apply(action: () => Promise<void>) {
		setSaving(true)
		try {
			await action()
			AlertActionCreators.dismissAlert(AlertKey)
		} catch {
			setError('Could not save your choice. Please try again.')
			setSaving(false)
		}
	}
	return (
		<Design.AlertModal
			title="Questify: read before using auto-completion"
			content={<Design.Text>{UsageWarning}</Design.Text>}
			extraContent={
				<View>
					<Design.Text
						color="text-link"
						onPress={() => Linking.openURL(PolicyUrl)}
					>
						Read Discord's platform manipulation policy
					</Design.Text>
					{!!error && <Design.Text>{error}</Design.Text>}
				</View>
			}
			actions={
				<View style={{ gap: 8 }}>
					<Design.Button
						text="Use display features only"
						variant="primary"
						disabled={saving}
						onPress={() => apply(decline)}
					/>
					<Design.Button
						text={`${step === 0 ? 'I understand the risks' : 'Confirm: allow auto-completion'}${remaining > 0 ? ` (${remaining}s)` : ''}`}
						variant="destructive"
						disabled={remaining > 0 || saving}
						onPress={() => {
							if (step === 0) {
								setStep(1)
								setRemaining(5)
							} else void apply(accept)
						}}
					/>
				</View>
			}
		/>
	)
}
export function showUsageWarning(
	storage: JsonStorage<Settings>,
	afterAccept?: () => Promise<void>,
) {
	AlertActionCreators.openAlert(
		AlertKey,
		<UsageDialog
			key={Date.now()}
			accept={async () => {
				await storage.set({
					warningVersion: WarningVersion,
					autoCompletionAllowed: true,
				})
				await afterAccept?.()
			}}
			decline={() =>
				storage.set(displayOnlySettings(normalizeSettings(storage.cache)), true)
			}
		/>,
		undefined,
		{ dismissable: false },
	)
}
export function warnBeforeSetting(
	storage: JsonStorage<Settings>,
	key: string,
	enable: boolean,
	apply: () => Promise<void>,
) {
	if (!enable) {
		void apply().catch(() =>
			ToastActionCreators.open('QUESTIFY_SETTINGS_ERROR', {
				text: 'Could not save this setting. Please try again.',
				variant: 'critical',
			}),
		)
		return
	}
	if (!completionAllowed(normalizeSettings(storage.cache))) {
		showUsageWarning(storage, apply)
		return
	}
	const warning = SettingWarnings[key]
	if (!warning) {
		void apply().catch(() =>
			ToastActionCreators.open('QUESTIFY_SETTINGS_ERROR', {
				text: 'Could not save this setting. Please try again.',
				variant: 'critical',
			}),
		)
		return
	}
	const alertKey = `questify-setting-${key}`
	AlertActionCreators.openAlert(
		alertKey,
		<Design.AlertModal
			title="Questify setting warning"
			content={
				<Design.Text>{`${warning}\n\nAuto-completion violates Discord's policy and can result in quest restrictions or account action.`}</Design.Text>
			}
			actions={
				<View style={{ gap: 8 }}>
					<Design.Button
						text="Keep disabled"
						variant="secondary"
						onPress={() => AlertActionCreators.dismissAlert(alertKey)}
					/>
					<Design.Button
						text="Enable anyway"
						variant="destructive"
						onPress={() => {
							void apply()
								.then(() => AlertActionCreators.dismissAlert(alertKey))
								.catch(() =>
									ToastActionCreators.open('QUESTIFY_SETTINGS_ERROR', {
										text: 'Could not save this setting. Please try again.',
										variant: 'critical',
									}),
								)
						}}
					/>
				</View>
			}
		/>,
	)
}
export function scheduleStartupWarning(
	cleanup: (fn: () => void) => void,
	storage: JsonStorage<Settings>,
) {
	let shown = false
	let disposed = false
	const show = () => {
		if (
			!disposed &&
			!shown &&
			AppState.currentState === 'active' &&
			normalizeSettings(storage.cache).warningVersion < WarningVersion
		) {
			shown = true
			showUsageWarning(storage)
		}
	}
	const timer = setTimeout(show, 2000)
	const listener = AppState.addEventListener('change', show)
	cleanup(() => {
		disposed = true
		clearTimeout(timer)
		listener.remove()
		if (shown) AlertActionCreators.dismissAlert(AlertKey)
	})
}
