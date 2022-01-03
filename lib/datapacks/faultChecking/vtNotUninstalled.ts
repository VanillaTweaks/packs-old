import type { PredicateCondition } from 'sandstone';
import { Predicate } from 'sandstone';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import vt from 'lib/datapacks/vt';

const $vtLoadStatus = loadStatusOf(vt);

/** A `PredicateCondition` that ensures VT is not uninstalled, since otherwise an advancement's reward function could run even after everything is supposed to be uninstalled. */
const vtNotUninstalled: PredicateCondition = {
	condition: 'minecraft:reference',
	name: Predicate(vt`not_uninstalled`, {
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
	// TODO: Remove `.toString()`.
	}).toString()
};

export default vtNotUninstalled;