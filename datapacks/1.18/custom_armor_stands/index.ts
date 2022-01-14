import onTrigger from 'lib/datapacks/pseudoEvents/onTrigger';
import pack from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import armorStandBookNBT from './armorStandBook/armorStandBookNBT';
import NBTRecipe from 'lib/datapacks/NBTRecipe';
import minify from 'lib/datapacks/textComponents/minify';

console.log(minify([
	{ text: 'a', color: 'red' },
	{ text: 'b', color: 'green' },
	{ text: 'c', color: 'blue' },
	{ text: 'd', color: 'green' }
]));

setMetaAdvancements({
	root: {
		icon: { item: 'minecraft:armor_stand' },
		description: 'Lets you customize armor stands, their poses, and all of their properties in survival or creative mode.'
	},
	usage: {
		titlePadding: 24,
		description: 'Put a book and an armor stand in a crafting table to get a magic book that lets you customize armor stands.'
	},
	opUsage: {
		titlePadding: 76
	}
});

NBTRecipe(pack, 'armor_stand_book', {
	// TODO: Remove type assertion.
	type: 'minecraft:crafting_shapeless' as 'crafting_shapeless',
	ingredients: [{
		item: 'minecraft:book'
	}, {
		item: 'minecraft:armor_stand'
	}],
	result: {
		item: 'minecraft:written_book',
		nbt: armorStandBookNBT
	}
});

onTrigger(pack, pack.NAMESPACE, pack.TITLE, trigger => {
	const $trigger = trigger('@s');

});

setConfigFunction(pack, () => {

});