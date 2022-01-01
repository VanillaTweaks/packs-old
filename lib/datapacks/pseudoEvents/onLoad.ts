import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { loadStatus, loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction, scoreboard } from 'sandstone';
import pack from 'lib/datapacks/pack';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import beforeSave from 'lib/beforeSave';

/** Adds to a `BasePath`'s `load` function, which is (indirectly) called by `#minecraft:load`. */
const onLoad = (
	/** The `BasePath` to put the `load` function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	const basePath_ = internalBasePath(basePath);

	const loadFunction = MCFunction(basePath_`load`, () => {
		if (firstOnLoad) {
			const $basePathLoadStatus = loadStatusOf(basePath);

			// TODO: Replace `$basePathLoadStatus.target, $basePathLoadStatus.objective` with `$basePathLoadStatus`.
			scoreboard.players.set($basePathLoadStatus.target, $basePathLoadStatus.objective, 1);

			if (basePath.version) {
				for (const versionKey of ['major', 'minor', 'patch'] as const) {
					scoreboard.players.set(
						// TODO: Replace `..., loadStatus.name` with `loadStatus(...)`.
						`${$basePathLoadStatus.target}.${versionKey}`,
						loadStatus.name,
						basePath.version[versionKey]
					);
				}
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
			beforeSave(import('lib/datapacks/faultChecking/checkLoadTagNotLoaded'));
		}
	}
};

export default onLoad;