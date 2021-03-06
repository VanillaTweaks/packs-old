// Creates a few advancements and functions to warn the server when the `function-permission-level` is too low.

import { advancement, Advancement, MCFunction, me } from 'sandstone';
import vt from 'lib/vt';
import onPlayerJoinOrLoad from 'lib/datapacks/pseudoEvents/onPlayerJoinOrLoad';
import vtNotUninstalled from 'lib/datapacks/faultChecking/vtNotUninstalled';

const functionPermissionLevel = vt.getChild('function_permission_level');

const rootAdvancement = Advancement(functionPermissionLevel`root`, {
	criteria: {
		impossible: {
			trigger: 'minecraft:impossible'
		}
	}
});

/** An advancement granted to all players and immediately revoked every tick, unless the `function-permission-level` is too low, in which case it will not be revoked. */
export const fplTooLowAdvancement = Advancement(functionPermissionLevel`too_low`, {
	parent: rootAdvancement,
	criteria: {
		tick: {
			trigger: 'minecraft:tick',
			conditions: {
				player: [vtNotUninstalled]
			}
		}
	},
	rewards: {
		function: MCFunction(functionPermissionLevel`_tick_advancement_reward`, () => {
			// Revoke immediately so that no player can ever have this advancement for a full tick as long as the `function-permission-level` isn't too low.
			advancement.revoke('@s').only(fplTooLowAdvancement);
		})
	}
});

/** An advancement which is only granted when the `function-permission-level` is too low. */
Advancement(functionPermissionLevel`warn`, {
	parent: rootAdvancement,
	criteria: {
		has_too_low_advancement: {
			trigger: 'minecraft:tick',
			conditions: {
				player: [vtNotUninstalled, {
					condition: 'minecraft:entity_properties',
					entity: 'this',
					predicate: {
						player: {
							advancements: {
								[fplTooLowAdvancement.name]: true
							}
						}
					}
				}]
			}
		}
	},
	rewards: {
		function: MCFunction(functionPermissionLevel`_warn`, () => {
			// This function must only use commands that don't require any permission level, such as `/me`.
			// Additionally, since `fixMaxCommandChainLength` doesn't work when the `function-permission-level` is too low, this function ideally should only have one command.

			me('??7- ??cError: The server\'s function permission level is set too low. It must be at least 2 for most data packs to work. An admin must open the server\'s ??6server.properties??c file in any text editor, find ??6function-permission-level??c, and set it equal to ??62??c, which is the default. Then save/upload the edited file and restart the server.');
		})
	}
});

// If not for this, a player could keep these advancements forever if they were granted them while the `function-permission-level` was too low for its reward function to revoke it, leading the advancement to never trigger for that player again.
onPlayerJoinOrLoad(functionPermissionLevel, () => {
	advancement.revoke('@s').from(rootAdvancement);
});