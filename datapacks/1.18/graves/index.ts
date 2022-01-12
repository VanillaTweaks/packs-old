import pack from 'lib/datapacks/pack';
import { Advancement, advancement, data, execute, MCFunction, NBT, schedule, tag } from 'sandstone';
import setMetaAdvancements from 'lib/datapacks/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';

setMetaAdvancements({
	root: {
		icon: {
			item: 'minecraft:stone_brick_wall'
		},
		titlePadding: 36,
		description: 'When you die, your items and/or XP will be stored safely in a grave instead of dropped.'
	},
	usage: {
		titlePadding: 40,
		description: [
			{ text: 'Right-click', color: 'yellow' },
			' your grave with an empty hand to retrieve its contents.',
			{ text: '\n\nHold crouch', color: 'yellow' },
			' while you right-click to make it so only you can pick up the items.'
		]
	},
	opUsage: {
		titlePadding: 56
	}
});

setConfigFunction(pack, () => {

});

const activateGrave = MCFunction(pack`_activate_grave`, () => {
	advancement.revoke('@s').only(interactWithGraveAdvancement);
	tag('@s').add('graves.subject');

	// Get the ID of the activated grave.
	execute
		.store.result.score('$activated', 'graves.dummy')
		.run.data.get.entity('@s', 'Inventory[{tag:{gravesData:{activator:1b}}}].tag.gravesData.id');

	// Check which grave matches that ID and tag it as activated.
	execute.as('@e[type=minecraft:armor_stand,tag=graves.hitbox]').run(pack`_check_hitbox`, () => {
		execute
			.store.result.score('@s', 'graves.id')
			.run.data.get.entity('@s', 'HandItems[1].tag.gravesData.id');
		execute
			.if.score('@s', 'graves.id', '=', '$activated', 'graves.dummy')
			.run.tag('@s').add('graves.activated');
	});

	// If grave robbing is disabled and they didn't use a grave key,
	execute.if.score('$robbing', 'graves.config', 'matches', 0).unless.data.entity('@e[type=minecraft:armor_stand,tag=graves.activated,limit=1]', 'ArmorItems[{tag:{gravesKey:1b}}]').run(pack`_check_owner`, () => {
		data.modify.storage('graves:storage', 'temp').set.from.entity('@s', 'UUID');
		execute
			.store.success.score('$success', 'graves.dummy')
			.run.data.modify.storage('graves:storage', 'temp').set.from.entity('@e[type=minecraft:armor_stand,tag=graves.activated,limit=1]', 'HandItems[1].tag.gravesData.uuid');
	});
});

const interactWithGraveAdvancement = Advancement(pack`interact_with_grave`, {
	criteria: {
		interact_with_grave: {
			trigger: 'minecraft:player_interacted_with_entity',
			conditions: {
				player: [checkLoadStatus()],
				entity: {
					type: 'minecraft:armor_stand',
					nbt: NBT.stringify({
						Tags: ['graves.hitbox']
					})
				}
			}
		}
	},
	rewards: {
		function: (
			MCFunction(pack`_interact_with_grave`, () => {
				activateGrave();
				schedule.function(pack`_activate_graves`, () => {
					execute
						.as(`@a[advancements={${interactWithGraveAdvancement}=true}]`)
						.at('@s')
						.run(activateGrave);
				}, '2t', 'append');
			})
		)
	}
});