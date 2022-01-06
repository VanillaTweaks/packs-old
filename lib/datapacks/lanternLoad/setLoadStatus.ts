import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { scoreboard } from 'sandstone';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';

/** An array of the targets of `loadStatus` scores for the `BasePath`s which `setLoadStatus` has already been called on. */
const loadStatusTargets: string[] = [];

/**
 * Sets a `BasePath`'s `loadStatus` score(s) `onLoad` and `onUninstall`.
 *
 * ⚠️ This already runs automatically for any `BasePath` which `onLoad` is called on.
 */
const setLoadStatus = (
	/** The `BasePath` to set the `loadStatus` score(s) of `onLoad` and `onUninstall`. */
	basePath: VTBasePathInstance
) => {
	const $basePathLoadStatus = loadStatusOf(basePath);

	const basePathLoadStatusTarget = $basePathLoadStatus.target.toString();
	if (loadStatusTargets.includes(basePathLoadStatusTarget)) {
		// Don't allow `setLoadStatus` to be called multiple times on the same `BasePath`.
		return;
	}
	loadStatusTargets.push(basePathLoadStatusTarget);

	onLoad(basePath, () => {
		scoreboard.players.set($basePathLoadStatus, 1);
	});

	onUninstall(basePath, () => {
		// Set to -1 instead of 0 so predicates can distinguish between uninstalled and not loaded.
		scoreboard.players.set($basePathLoadStatus, -1);
	});

	if (basePath.version) {
		for (const versionKey of ['major', 'minor', 'patch'] as const) {
			onLoad(basePath, () => {
				scoreboard.players.set(
					`${$basePathLoadStatus.target}.${versionKey}`,
					loadStatus,
					basePath.version![versionKey]
				);
			});

			onUninstall(basePath, () => {
				scoreboard.players.set(
					`${$basePathLoadStatus.target}.${versionKey}`,
					loadStatus,
					0
				);
			});
		}
	}
};

export default setLoadStatus;