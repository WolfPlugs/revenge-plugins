# WolfPlugs for Revenge

Global Badges adds profile badges from other Discord clients and BadgeVault to Revenge Next.

## Install

Add this repository in Revenge's plugin repository settings:

https://wolfplugs.github.io/revenge-plugins

Install Global Badges, then reload Revenge.

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

Global Badges is adapted from Wolfie and thororen's Vendetta plugin. The repository tooling is derived from [Revenge Community Plugins](https://github.com/revenge-mod/revenge-community-plugins).

Licensed under [GPL-3.0](LICENSE). Original Git history and attribution are preserved.
