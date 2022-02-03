import type { PredicateCondition } from 'sandstone';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import type { BaseLocationInstance } from 'lib/BaseLocation';
import pack from 'lib/pack';

/**
 * Returns a `PredicateCondition`, to include in an advancement criterion's `player` condition, which ensures a `BaseLocation` (the `pack` by default) is loaded, since otherwise an advancement's reward function could run even after everything is supposed to be uninstalled, or while the `function-permission-level` is too low.
 *
 * This should be used in practically every technical advancement that has a function reward.
 */
const checkLoadStatus = (baseLocation: BaseLocationInstance = pack): PredicateCondition => {
	const $baseLocationLoadStatus = loadStatusOf(baseLocation);

	return {
		condition: 'minecraft:value_check',
		value: {
			type: 'minecraft:score',
			target: {
				type: 'minecraft:fixed',
				name: $baseLocationLoadStatus.target.toString()
			},
			score: $baseLocationLoadStatus.objective
		},
		range: 1
	// TODO: Remove `as any`.
	} as any;
};

export default checkLoadStatus;