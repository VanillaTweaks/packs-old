import pack, { pack_ } from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/pack/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import onUninstall from 'lib/datapacks/onUninstall';
import onLoad from 'lib/datapacks/onLoad';
import every from 'lib/datapacks/every';
import { execute, Recipe, say, setblock } from 'sandstone';
import onPlayerLoadOrJoin from 'lib/datapacks/vt/onPlayerLoadOrJoin';

setMetaAdvancements({
	root: {
		icon: {
			item: 'minecraft:armor_stand'
		},
		titleSpaces: 9,
		description: [
			'',
			{ text: 'Lets you customize armor stands, their poses, and all of their properties in survival or creative mode.', color: 'gold' }
		]
	},
	usage: {
		titleSpaces: 10,
		description: [
			''
		]
	},
	opUsage: {
		titleSpaces: 14
	}
});

Recipe(pack`book`, {
	type: 'crafting_shapeless',
	ingredients: [
		{ item: 'minecraft:book' },
		{ item: 'minecraft:armor_stand' }
	],
	result: { item: 'minecraft:knowledge_book' }
// TODO: Remove `as any`.
} as any);

onPlayerLoadOrJoin(pack_`test`, () => {
	say('hi');
	execute.at('@s').run.setblock(['~', '~', '~'], 'minecraft:redstone_block');
});

onLoad(pack, () => {

});

every('1t', pack, () => {

});

onUninstall(pack, () => {

});

setConfigFunction(pack, () => {

});