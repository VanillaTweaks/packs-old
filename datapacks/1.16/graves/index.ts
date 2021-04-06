import { pack, pack_ } from 'modules/datapacks/pack';
import { configLine, horizontalBar, pageHead } from 'modules/datapacks/commands/text';
import { advancement, execute, schedule, tag } from 'sandstone';

pack.options.shortName = 'graves';

pack.setMetaAdvancements({
	root: {
		icon: {
			item: 'minecraft:stone_brick_wall'
		},
		titleSpaces: 9,
		description: [
			'',
			{ text: 'When you die, your items and/or XP will be stored safely in a grave instead of dropped.', color: 'gold' }
		]
	},
	usage: {
		titleSpaces: 10,
		description: [
			'',
			{ text: 'Right-click', color: 'yellow' },
			{ text: ' your grave with an empty hand to retrieve its contents.', color: 'gold' },
			{ text: '\n\nHold crouch', color: 'yellow' },
			{ text: ' while you right-click to make it so only you can pick up the items.', color: 'gold' }
		]
	},
	opUsage: {
		titleSpaces: 14
	}
});

pack.onLoad(() => {
	
});

pack.onUninstall(() => {
	
});

pack.ConfigFunction(() => {
	
});

const interactWithGraveAdvancement = pack.FunctionalAdvancement('interact_with_grave', {
	trigger: 'minecraft:player_interacted_with_entity',
	conditions: {
		entity: {
			type: 'minecraft:armor_stand',
			nbt: '{Tags:["graves.hitbox"]}'
		}
	}
}, pack_.MCFunction('interact_with_grave', () => {
	const activateGrave = pack_.MCFunction('activate_grave', () => {
		advancement.revoke('@s').only(interactWithGraveAdvancement);
		tag('@s').add('graves.subject');
		execute.store.result.score('#activated', 'graves.dummy').run.data.get.entity('@s', 'Inventory[{tag:{gravesData:{activator:1b}}}].tag.gravesData.id');
		execute.as('@e[type=minecraft:armor_stand]');
	});
	activateGrave();
	schedule.function(pack_.MCFunction('activate_graves', () => {
		execute.as(`@a[advancements={${interactWithGraveAdvancement}=true}]`).at('@s').run(activateGrave);
	}), '1t', 'append');
}));