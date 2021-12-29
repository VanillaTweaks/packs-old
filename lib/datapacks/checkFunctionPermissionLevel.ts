import { advancement, Advancement, MCFunction, me } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';

const functionPermissionLevel = vt.child({ directory: 'function_permission_level' });
const functionPermissionLevel_ = internalBasePath(functionPermissionLevel);

/** Revokes all of `functionPermissionLevel`'s advancements. */
const revokeAdvancements = MCFunction(functionPermissionLevel_`revoke_advancements`, () => {
	// Revoke this advancement so players can never have it for at least a tick if the `function-permission-level` is too low.
	advancement.revoke('@s').only(tooLowAdvancement);

	// Revoke the `warnAdvancement` so it can be granted again if the `function-permission-level` is lowered in the future.
	advancement.revoke('@s').only(warnAdvancement);
});

/** A periodically granted advancement that players can only have if the `function-permission-level` is or ever was too low, since its reward function immediately revokes it when it isn't. */
const tooLowAdvancement = Advancement(functionPermissionLevel`too_low`, {
	criteria: {
		tick: {
			trigger: 'minecraft:tick',
			conditions: {
				player: {
					condition: 'minecraft:time_check',
					// The number of ticks between attempts to grant this advancement.
					period: 20 * 5,
					value: 0
				}
			}
		}
	},
	rewards: {
		function: revokeAdvancements
	}
});

/** An advancement which is only granted when the `function-permission-level` is too low for the first time that the player is online for. */
const warnAdvancement = Advancement(functionPermissionLevel`warn`, {
	criteria: {
		tick: {
			trigger: 'minecraft:tick',
			conditions: {
				player: [{
					condition: 'minecraft:entity_properties',
					entity: 'this',
					predicate: {
						player: {
							advancements: {
								[tooLowAdvancement.toString()]: true
							}
						}
					}
				}]
			}
		}
	},
	rewards: {
		function: MCFunction(functionPermissionLevel_`warn`, () => {
			// This function must only use commands that don't require any permission level, such as `/me`.

			me('§7- §cError: The server\'s function permission level is set too low. It needs to be at least 2 for most data packs to function. An admin must open the server\'s §6server.properties§c file, find §6function-permission-level§c, and set it equal to §62§c, which is the default. Then save/upload the edited file and restart the server.');
		})
	}
});

export default {};