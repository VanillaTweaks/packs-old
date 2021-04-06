# Vanilla Tweaks Packs

This is the official repo for the source of some of the [Vanilla Tweaks](https://vanillatweaks.net/) packs.

## Compilation

To compile a pack, run the pack directory's `build.sh` script from inside the directory of the pack you want to compile.

Example:

```sh
cd ./datapacks/1.16/graves
../../build.sh
```

## Development

To actively develop a pack, do the same but with `watch.sh` instead of `build.sh`. This will automatically re-compile when the pack is edited.

Example:

```sh
cd ./datapacks/1.16/graves
../../watch.sh
```