import type { AdvancementJSON, MCFunctionInstance } from 'sandstone';
import { Advancement } from 'sandstone';
import { pack_ } from 'lib/datapacks/pack';

/**
 * Creates an `Advancement` to be used only for the sake of its reward function.
 *
 * Use this instead of `Advancement` whenever applicable.
 */
const FunctionalAdvancement = (
	/** The namespaced name of this advancement. Shouldn't be on a `BasePath` returned from `getInternalChild`. */
	name: string,
	criterion: AdvancementJSON['criteria'][0],
	...args: (
		[MCFunctionInstance]
		| Parameters<typeof pack_.MCFunction>
	)
) => (
	Advancement(name, {
		criteria: {
			[name]: criterion
		},
		rewards: {
			function: (
				typeof args[0] === 'function'
					? args[0]
					: pack_.MCFunction(...args as unknown as Parameters<typeof pack_.MCFunction>)
			)
		}
	})
);

export default FunctionalAdvancement;