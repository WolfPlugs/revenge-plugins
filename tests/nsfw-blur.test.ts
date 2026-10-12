import { expect, test } from 'bun:test'
import {
	blurEmbeds,
	isNsfwChannel,
	isVisualAttachment,
	withBlur,
} from '../plugins/nsfw-blur/media'

test('NSFW channels and threads inherit the correct channel label', () => {
	const lookup = (id: string) =>
		id === 'adult' ? { nsfw: true } : { nsfw: false }
	expect(isNsfwChannel({ nsfw: true }, lookup)).toBe(true)
	expect(isNsfwChannel({ parent_id: 'adult' }, lookup)).toBe(true)
	expect(isNsfwChannel({ parent_id: 'general' }, lookup)).toBe(false)
	expect(isNsfwChannel(undefined, lookup)).toBe(false)
})

test('only image and video attachments receive blur', () => {
	for (const filename of [
		'photo.JPG',
		'clip.mp4',
		'animation.gif',
		'clip.webm',
	])
		expect(isVisualAttachment({ filename })).toBe(true)
	expect(isVisualAttachment({ content_type: 'video/quicktime' })).toBe(true)
	for (const value of [
		null,
		{},
		{ filename: 'notes.txt' },
		{ filename: 'audio.mp3' },
	])
		expect(isVisualAttachment(value)).toBe(false)
})

test('uses native blur rather than spoiler labels', () => {
	const original = { isSpoiler: false, obscure: false, verifyAge: false }
	expect(withBlur(original, false)).toEqual({
		...original,
		obscure: true,
		obscureDescription: 'Tap to reveal',
		obscureIsOpaque: false,
	})
	expect(original.obscure).toBe(false)
	expect(withBlur({ isSpoiler: false }, true)).toEqual({
		isSpoiler: false,
		isObscured: true,
		obscureDescription: 'Tap to reveal',
		obscureIsOpaque: false,
	})
})

test('preserves existing sensitive-media restrictions', () => {
	const attachment = { obscure: true, verifyAge: true, obscureIsOpaque: true }
	const embedded = { isObscured: true, verifyAge: true, obscureIsOpaque: true }
	expect(withBlur(attachment, false)).toBe(attachment)
	expect(withBlur(embedded, true)).toBe(embedded)
})

test('blurs image, thumbnail and video link embeds without changing text embeds', () => {
	const text = { title: 'Plain text' }
	const restricted = {
		image: {},
		obscure: 'Sensitive media',
		verifyAge: true,
		obscureIsOpaque: true,
	}
	const media = [
		{ image: { url: 'image' } },
		{ thumbnail: { url: 'thumb' } },
		{ video: { url: 'video' } },
		{ images: [{ url: 'gallery' }] },
	]
	expect(blurEmbeds([...media, text, restricted])).toEqual([
		...media.map(embed => ({
			...embed,
			obscure: 'Tap to reveal',
			obscureIsOpaque: false,
		})),
		text,
		restricted,
	])
	expect(media[0]).not.toHaveProperty('obscure')
})
