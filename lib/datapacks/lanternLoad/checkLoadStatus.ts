import type { PredicateCondition } from 'sandstone';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import pack from 'lib/datapacks/pack';

/**
 * Returns a `PredicateCondition`, to include in an advancement criterion's `player` condition, which ensures a `ResourceLocation` (the `pack` by default) is loaded, since otherwise an advancement's reward function could run even after everything is supposed to be uninstalled, or while the `function-permission-level` is too low.
 *
 * This should be used in practically every technical advancement that has a function reward.
 */
const checkLoadStatus = (resourceLocation: ResourceLocationInstance = pack): PredicateCondition => {
	const $resourceLocationLoadStatus = loadStatusOf(resourceLocation);

	return {
		condition: 'minecraft:value_check',
		value: {
			type: 'minecraft:score',
			target: {
				type: 'minecraft:fixed',
				name: $resourceLocationLoadStatus.target.toString()
			},
			score: $resourceLocationLoadStatus.objective
		},
		range: 1
	// TODO: Remove `as any`.
	} as any;
};

export default checkLoadStatus;