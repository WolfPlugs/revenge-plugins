import { getModules } from '@revenge-mod/modules/finders'
import { withName } from '@revenge-mod/modules/finders/filters'
import { after, instead } from '@revenge-mod/patcher'

type ChatInput = {
	handleSelectGIF(gif: unknown): unknown
	getText(): unknown
	insertText(
		text: string,
		start: number,
		appendSpace: boolean,
		nodes: undefined,
		end: number,
	): unknown
}

function isChatInput(value: unknown): value is ChatInput {
	return (
		typeof value === 'object' &&
		value !== null &&
		'handleSelectGIF' in value &&
		typeof value.handleSelectGIF === 'function' &&
		'getText' in value &&
		typeof value.getText === 'function' &&
		'insertText' in value &&
		typeof value.insertText === 'function'
	)
}

export default plugin({
	start({ cleanup, plugin }) {
		const patched = new WeakSet<object>()
		cleanup(
			getModules(
				withName<(...args: unknown[]) => unknown>('useChatInputRefs'),
				module => {
					if (!('default' in module) || typeof module.default !== 'function')
						return
					cleanup(
						after(module, 'default', refs => {
							if (
								typeof refs !== 'object' ||
								refs === null ||
								!('chatInput' in refs) ||
								typeof refs.chatInput !== 'object' ||
								refs.chatInput === null ||
								!('current' in refs.chatInput)
							)
								return refs
							const input = refs.chatInput.current
							if (!isChatInput(input) || patched.has(input)) return refs
							patched.add(input)
							cleanup(
								instead(input, 'handleSelectGIF', ([gif]) => {
									if (
										typeof gif !== 'object' ||
										gif === null ||
										!('url' in gif) ||
										typeof gif.url !== 'string' ||
										!/^https?:\/\/\S+$/i.test(gif.url)
									) {
										plugin.reportError(new Error('This GIF has no usable URL.'))
										return
									}
									const text = input.getText()
									if (typeof text !== 'string') {
										plugin.reportError(
											new Error('Could not read the message draft.'),
										)
										return
									}
									const separator = text && !/\s$/.test(text) ? '\n' : ''
									return input.insertText(
										separator + gif.url,
										text.length,
										true,
										undefined,
										text.length,
									)
								}),
							)
							return refs
						}),
					)
				},
				{ returnNamespace: true, max: 1 },
			),
		)
		if (plugin.startedLate) plugin.requireReload()
	},
})
