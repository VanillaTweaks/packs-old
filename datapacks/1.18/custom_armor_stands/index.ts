import onTrigger from 'lib/datapacks/pseudoEvents/onTrigger';
import pack from 'lib/pack';
import setMetaAdvancements from 'lib/datapacks/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import armorStandBook from './armorStandBook';
import NBTRecipe from 'lib/datapacks/NBTRecipe';
import { execute, tag } from 'sandstone';
import copyBookToStorage from './copy/copyBookToStorage';
import copyStorageToBook from './copy/copyStorageToBook';
import select from './select';
import { $bookLocation, BookLocation } from './copy';

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
		.run(pack`trigger/store_book`, () => {
			copyBookToStorage();

			execute
				.unless($bookLocation.matches(BookLocation.NOT_FOUND))
				.run(pack`trigger/main`, () => {
					// Tag the player so they can still be selected when executing as something else (e.g. an armor stand).
					tag('@s').add(pack.triggerer);

					execute
						// TODO: Remove `as any`.
						.if($trigger.matches('100..199' as any))
						.run(pack`trigger/1xx`, () => {
							execute
								.if($trigger.matches(100))
								.at('@s')
								.as('@e[type=minecraft:armor_stand,distance=..24,sort=nearest,limit=1]')
								.run(select);

							execute
								.if($trigger.matches(101))
								.run.tellraw('@s', 'TODO: Select using mouse');
						});

					tag('@s').remove(pack.triggerer);

					copyStorageToBook();
				});
		});
});

setConfigFunction(pack, () => {

});