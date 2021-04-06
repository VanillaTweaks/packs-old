# Vanilla Tweaks Packs

This is the official repo for the source of some of the [Vanilla Tweaks](https://vanillatweaks.net/) packs.

## Compilation

To compile a pack, run `npm run build` followed by the path of the data pack's directory.

Example:

```sh
npm run build datapacks/1.16/graves
```

## Development

To actively develop a pack, do the same but with `watch` instead of `build`. This will automatically re-compile when the pack is edited.

Example:

```sh
npm run watch datapacks/1.16/graves
```