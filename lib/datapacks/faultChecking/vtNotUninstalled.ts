import type { PredicateCondition } from 'sandstone';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import vt from 'lib/datapacks/vt';

const $vtLoadStatus = loadStatusOf(vt);

/**
 * A `PredicateCondition` that ensures VT is not uninstalled, since otherwise an advancement's reward function could run even after everything is supposed to be uninstalled.
 *
 * ⚠️ Only for use within `faultChecking` modules.
 */
const vtNotUninstalled: PredicateCondition = {
	condition: 'minecraft:inverted',
	term: {
		condition: 'minecraft:value_check',
		value: {
			type: 'minecraft:score',
			target: {
				type: 'minecraft:fixed',
				name: $vtLoadStatus.target.toString()
			},
			score: $vtLoadStatus.objective
		},
		range: -1
	// TODO: Remove `as any`.
	} as any
};

export default vtNotUninstalled;