import type { AdvancementJSON, MCFunctionInstance } from 'sandstone';
import { Advancement } from 'sandstone';
import { pack } from 'lib/datapacks/pack';

/**
 * Creates an `Advancement` to be used only for the sake of its reward function.
 *
 * Use this instead of `Advancement` whenever applicable.
 */
const FunctionalAdvancement = (
	/** The namespaced name of this advancement. Shouldn't be on an `internal` base path like `pack_`. */
	name: string,
	criterion: AdvancementJSON['criteria'][0],
	...args: (
		[MCFunctionInstance]
		| Parameters<typeof pack.MCFunction>
	)
) => (
	Advancement(name, {
		display: {
			icon: {
				item: 'minecraft:air'
			},
			title: '',
			description: '',
			show_toast: false,
			announce_to_chat: false,
			hidden: true
		},
		criteria: {
			[name]: criterion
		},
		rewards: {
			function: (
				typeof args[0] === 'function'
					? args[0]
					: pack.internal.MCFunction(...args as unknown as Parameters<typeof pack.MCFunction>)
			)
		}
	})
);

export default FunctionalAdvancement;