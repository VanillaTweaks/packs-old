import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { loadStatus, loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction, scoreboard } from 'sandstone';
import pack from 'lib/datapacks/pack';
import loadStatusScore from 'lib/datapacks/lanternLoad/loadStatusScore';
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
			const $basePathLoadStatus = loadStatusScore(basePath);

			// TODO: Replace `$basePathLoadStatus.target, $basePathLoadStatus.objective` with `$basePathLoadStatus`.
			scoreboard.players.set($basePathLoadStatus.target, $basePathLoadStatus.objective, 1);

			if (basePath.version) {
				// TODO: Replace all `..., loadStatus.name` with `loadStatus(...)`.
				scoreboard.players.set(`#${$basePathLoadStatus.target}.major`, loadStatus.name, basePath.version.major);
				scoreboard.players.set(`#${$basePathLoadStatus.target}.minor`, loadStatus.name, basePath.version.minor);
				scoreboard.players.set(`#${$basePathLoadStatus.target}.patch`, loadStatus.name, basePath.version.patch);
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
			beforeSave(import('lib/datapacks/faultChecking/checkLoadTag'));
		}
	}
};

export default onLoad;