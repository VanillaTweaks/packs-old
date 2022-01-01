import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { loadStatus, loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction, scoreboard } from 'sandstone';
import pack from 'lib/datapacks/pack';
import onAdvancementTick from 'lib/datapacks/onAdvancementTick';

/** Adds to a `BasePath`'s `load` function, which is (indirectly) called by `#minecraft:load`. */
const onLoad = (
	/** The `BasePath` to put the `load` function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	const basePath_ = internalBasePath(basePath);

	const loadFunction = MCFunction(basePath_`load`, () => {
		if (firstOnLoad) {
			let basePathName = basePath.namespace;
			if (basePath.directory) {
				basePathName += `.${basePath.directory.replace(/\//g, '.')}`;
			}

			// TODO: Remove all `.name` from `loadStatus.name`.
			scoreboard.players.set(basePathName, loadStatus.name, 1);

			if (basePath.version) {
				scoreboard.players.set(`#${basePathName}.major`, loadStatus.name, basePath.version.major);
				scoreboard.players.set(`#${basePathName}.minor`, loadStatus.name, basePath.version.minor);
				scoreboard.players.set(`#${basePathName}.patch`, loadStatus.name, basePath.version.patch);
			}
		}

		callback();
	}, {
		onConflict: 'append'
	});

	/** Whether this is the first time `onLoad` has been called on this `basePath`. */
	// TODO: Set this to `!loadTag.has(loadFunction)` instead.
	const firstOnLoad = !loadTag.values.some(value => value.toString() === loadFunction.toString());

	if (firstOnLoad) {
		// TODO: Remove `as any`.
		loadTag.add(loadFunction as any);

		if (basePath === pack) {
			// It is a common error for data packs to reference missing functions from their `#minecraft:load` tag. This causes the entire `#minecraft:load` tag to break, becoming empty for all data packs.
			// Detect a broken `#minecraft:load` tag by checking whether the pack failed to set its `loadStatus`.

			onAdvancementTick(basePath, () => {

			});
		}
	}
};

export default onLoad;