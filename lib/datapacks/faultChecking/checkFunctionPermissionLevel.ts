// Creates a few advancements and functions to warn the server when the `function-permission-level` is too low.

import { Advancement, MCFunction, me } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import revokeOnPlayerLoadOrJoin from 'lib/datapacks/revokeOnPlayerLoadOrJoin';
import { tickAdvancement } from 'lib/datapacks/pseudoEvents/onAdvancementTick';

const functionPermissionLevel = vt.child({ directory: 'function_permission_level' });
const functionPermissionLevel_ = internalBasePath(functionPermissionLevel);

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
								[tickAdvancement.toString()]: true
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
			// Additionally, since `fixMaxCommandChainLength` doesn't work when the `function-permission-level` is too low, this function ideally should only have one command.

			me('§7- §cError: The server\'s function permission level is set too low. It needs to be at least 2 for most data packs to function. An admin must open the server\'s §6server.properties§c file, find §6function-permission-level§c, and set it equal to §62§c, which is the default. Then save/upload the edited file and restart the server.');
		})
	}
});
revokeOnPlayerLoadOrJoin(functionPermissionLevel, warnAdvancement);