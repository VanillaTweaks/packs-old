import type { ObjectiveInstance, Score } from 'sandstone';
import { Predicate } from 'sandstone';

/** Returns a predicate which checks that a score on `@s` equals another score. */
const hasEqualScore = (
	/** The namespaced name of the predicate to create. */
	name: string,
	/** The objective which has the score to check on `@s`. */
	objective: ObjectiveInstance,
	/** The score (usually in the `temp` objective) which should equals `@s`'s score. */
	$score: Score
) => (
	Predicate(name, {
		condition: 'minecraft:value_check',
		value: {
			type: 'minecraft:score',
			target: 'this',
			score: objective.name
		},
		range: {
			min: {
				type: 'minecraft:score',
				target: {
					type: 'minecraft:fixed',
					name: $score.target.toString()
				},
				score: $score.objective.name
			},
			max: {
				type: 'minecraft:score',
				target: {
					type: 'minecraft:fixed',
					name: $score.target.toString()
				},
				score: $score.objective.name
			}
		}
	// TODO: Remove `as any`.
	} as any)
);

export default hasEqualScore;