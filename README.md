# WolfPlugs for Revenge

Bunch of plugins from wolf which are published before going to the main repo or not

## Install

Add this repository in Revenge's plugin repository settings:

https://plugins.obamabot.me/revenge-plugins

Install wolf plugins, then reload Revenge.

## PetPet

Use `/petpet user:@someone` to generate a 128px PetPet GIF on your device.
The GIF is added to the current message's attachment tray. Add any text, then
send it normally. Only the selected user's avatar is downloaded from Discord;
generation does not use an external PetPet service.

To verify PetPet locally:

```sh
bun test scripts/petpet.test.ts
bun run build petpet
bun scripts/check-petpet-bundle.mjs
```

## AddAttachments

Enable AddAttachments, edit a message, select images with Discord's attachment
picker, then press send to save. Queued files upload with the edit and existing
attachments stay on the message. Files leave the tray immediately when you save
the edit so they cannot be sent again as a new message. If uploading or saving fails, the files return to the tray.

The plugin uses the current channel's attachment tray, including any files queued
before you started editing. Discord's limit of ten attachments per message applies.

To verify locally:

```sh
bun test scripts/add-attachments.test.ts
bun run build add-attachments
```

The upload flow still needs verification on a device running Revenge.

## Development

```sh
bun install
bun run package
bun run serve
```

Add the repository URL printed by the server to Revenge on your device. The device must be able to reach your computer.

```sh
bun run lint:types
bunx biome check plugins scripts
```

## Releases

Push to `main` after increasing the plugin version in `plugins/global-badges/manifest.json`. GitHub Actions builds the ZIP, publishes it on `gh-pages`, and deploys the repository index and artifacts to GitHub Pages.

The release workflow can also be run manually. Published versions are kept for existing installs.

## Credits and license

The repository tooling is derived from [Revenge Community Plugins](https://github.com/revenge-mod/revenge-community-plugins).

Licensed under [GPL-3.0](LICENSE). Original Git history and attribution are preserved.
