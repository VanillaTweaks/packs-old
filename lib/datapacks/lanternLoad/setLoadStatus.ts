import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import { scoreboard } from 'sandstone';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';

/** An array of the targets of `loadStatus` scores for the `ResourceLocation`s which `setLoadStatus` has already been called on. */
const loadStatusTargets: string[] = [];

/**
 * Sets a `ResourceLocation`'s `loadStatus` score(s) `onLoad` and `onUninstall`.
 *
 * ⚠️ This already runs automatically for any `ResourceLocation` which `onLoad` is called on.
 */
const setLoadStatus = (
	/** The `ResourceLocation` to set the `loadStatus` score(s) of `onLoad` and `onUninstall`. */
	resourceLocation: ResourceLocationInstance
) => {
	const $resourceLocationLoadStatus = loadStatusOf(resourceLocation);

	const resourceLocationLoadStatusTarget = $resourceLocationLoadStatus.target.toString();
	if (loadStatusTargets.includes(resourceLocationLoadStatusTarget)) {
		// Don't allow `setLoadStatus` to be called multiple times on the same `ResourceLocation`.
		return;
	}
	loadStatusTargets.push(resourceLocationLoadStatusTarget);

	onLoad(resourceLocation, () => {
		scoreboard.players.set($resourceLocationLoadStatus, 1);
	});

	onUninstall(resourceLocation, () => {
		// Set to -1 instead of 0 so predicates can distinguish between uninstalled and not loaded.
		scoreboard.players.set($resourceLocationLoadStatus, -1);
	});

	if (resourceLocation.VERSION) {
		for (const versionKey of ['major', 'minor', 'patch'] as const) {
			onLoad(resourceLocation, () => {
				scoreboard.players.set(
					`${$resourceLocationLoadStatus.target}.${versionKey}`,
					loadStatus,
					resourceLocation.VERSION![versionKey]
				);
			});

			onUninstall(resourceLocation, () => {
				scoreboard.players.set(
					`${$resourceLocationLoadStatus.target}.${versionKey}`,
					loadStatus,
					0
				);
			});
		}
	}
};

export default setLoadStatus;