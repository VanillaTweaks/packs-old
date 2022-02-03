import type { BaseLocationInstance } from 'lib/BaseLocation';
import { scoreboard } from 'sandstone';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';

/** An array of the targets of `loadStatus` scores for the `BaseLocation`s which `setLoadStatus` has already been called on. */
const loadStatusTargets: string[] = [];

/**
 * Sets a `BaseLocation`'s `loadStatus` score(s) `onLoad` and `onUninstall`.
 *
 * ⚠️ This already runs automatically for any `BaseLocation` which `onLoad` is called on.
 */
const setLoadStatus = (
	/** The `BaseLocation` to set the `loadStatus` score(s) of `onLoad` and `onUninstall`. */
	baseLocation: BaseLocationInstance
) => {
	const $baseLocationLoadStatus = loadStatusOf(baseLocation);

	const baseLocationLoadStatusTarget = $baseLocationLoadStatus.target.toString();
	if (loadStatusTargets.includes(baseLocationLoadStatusTarget)) {
		// Don't allow `setLoadStatus` to be called multiple times on the same `BaseLocation`.
		return;
	}
	loadStatusTargets.push(baseLocationLoadStatusTarget);

	onLoad(baseLocation, () => {
		scoreboard.players.set($baseLocationLoadStatus, 1);
	});

	onUninstall(baseLocation, () => {
		// Set to -1 instead of 0 so predicates can distinguish between uninstalled and not loaded.
		scoreboard.players.set($baseLocationLoadStatus, -1);
	});

	if (baseLocation.VERSION) {
		for (const versionKey of ['major', 'minor', 'patch'] as const) {
			onLoad(baseLocation, () => {
				scoreboard.players.set(
					`${$baseLocationLoadStatus.target}.${versionKey}`,
					loadStatus,
					baseLocation.VERSION![versionKey]
				);
			});

			onUninstall(baseLocation, () => {
				scoreboard.players.set(
					`${$baseLocationLoadStatus.target}.${versionKey}`,
					loadStatus,
					0
				);
			});
		}
	}
};

export default setLoadStatus;