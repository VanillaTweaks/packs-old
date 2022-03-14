import onTrigger from 'lib/datapacks/pseudoEvents/onTrigger';
import pack from 'lib/pack';
import setMetaAdvancements from 'lib/datapacks/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import armorStandBook from './armorStandBook';
import NBTRecipe from 'lib/datapacks/NBTRecipe';
import { execute } from 'sandstone';
import copyBookToStorage from './copy/copyBookToStorage';
import copyStorageToBook from './copy/copyStorageToBook';

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

NBTRecipe(pack, {
	// TODO: Remove type assertion.
	type: 'minecraft:crafting_shapeless' as 'crafting_shapeless',
	ingredients: [{
		item: 'minecraft:book'
	}, {
		item: 'minecraft:armor_stand'
	}],
	result: {
		item: armorStandBook
	}
});

onTrigger(pack, pack.NAMESPACE, pack.TITLE, triggerObjective => {
	const $trigger = triggerObjective('@s');

	execute
		.if($trigger.matches(1))
		.run.tellraw('@s', {
			text: 'For help with Custom Armor Stands, see the Vanilla Tweaks advancement tab.',
			color: 'gold'
		});

	execute
		// TODO: Remove `as any`.
		.if($trigger.matches('100..' as any))
		.run(pack`trigger/main`, () => {
			copyBookToStorage();



			copyStorageToBook();
		});
});

setConfigFunction(pack, () => {

});