# NSFW Blur

Blurs image and video attachments and image/video embeds in NSFW channels using Discord mobile's native sensitive-media blur controls. Tap a hidden attachment to reveal it. Threads inherit the parent channel's NSFW label.

Enable "Blur media in all channels" to also hide media outside NSFW channels. Reopen the channel after changing this setting to refresh existing messages. Use the blur-strength slider to adjust the radius from 1 to 25. Tap anywhere on blurred media to reveal it.

This uses the channel's NSFW label, not image recognition. Existing Discord sensitive-media and age-verification controls stay in place.

Built for Revenge Next with a native Android component. This targets chat message rows, not search results or forum previews. Discord updates may change its native views.

For local builds, set `KOTLIN_HOME`, `ANDROID_JAR`, `REVENGE_API_JAR`, `XPOSED_API_JAR`, and `D8`, then run `bun run package`. GitHub Actions prepares the native compiler automatically.

Inspired by Equicord's BlurNSFW behavior. Implemented separately for Discord mobile.
