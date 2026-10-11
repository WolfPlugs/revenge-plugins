import { describe, expect, test } from 'bun:test'
import {
	DefaultSettings,
	SoundGroups,
	shouldMute,
} from '../plugins/sound-controls/sounds'

describe('Sound Controls filtering', () => {
	test('mutes incoming ringing and joins by default', () => {
		for (const name of [
			'call_ringing',
			'halloween_call_ringing',
			'call_ringing_halloween',
			'winter_user_join',
			'user_join',
		]) {
			expect(shouldMute(name, DefaultSettings)).toBe(true)
		}
		for (const name of [
			'call_calling',
			'user_leave',
			'mute',
			'soundboard_sound',
			'activity_user_join',
			'https://example.com/user_join.mp3',
		]) {
			expect(shouldMute(name, DefaultSettings)).toBe(false)
		}
	})

	test('allows all sounds when switches are off', () => {
		expect(shouldMute('call_ringing', { muted: { ringtone: false } })).toBe(
			false,
		)
		expect(shouldMute('user_join', { muted: {} })).toBe(false)
	})

	test('separates mute effects from deafen effects', () => {
		const settings = { muted: { mute: true } }
		expect(shouldMute('unmute', settings)).toBe(false)
		expect(shouldMute('winter_mute', settings)).toBe(true)
		expect(shouldMute('undeafen', settings)).toBe(false)
	})

	test('each switch mutes only its own sound', () => {
		for (const [key, selected] of Object.entries(SoundGroups)) {
			for (const sound of Object.values(SoundGroups)) {
				expect(shouldMute(sound.names[0], { muted: { [key]: true } })).toBe(
					sound === selected,
				)
			}
		}
	})

	test('handles message sound packs and unexpected inputs', () => {
		expect(shouldMute('lofi_message1', { muted: { message1: true } })).toBe(
			true,
		)
		for (const value of [null, undefined, {}, { muted: null }]) {
			expect(shouldMute('call_ringing', value)).toBe(false)
		}
		expect(shouldMute(123, DefaultSettings)).toBe(false)
	})
})
