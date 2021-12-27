import NBTRecipe from 'lib/datapacks/NBTRecipe';
import onTrigger from 'lib/datapacks/onTrigger';
import pack from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/pack/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import bookNBT from './book/bookNBT';

setMetaAdvancements({
	root: {
		icon: {
			item: 'minecraft:armor_stand'
		},
		titlePadding: 36,
		description: [
			'',
			{ text: 'Lets you customize armor stands, their poses, and all of their properties in survival or creative mode.', color: 'gold' }
		]
	},
	usage: {
		titlePadding: 40,
		description: [
			''
		]
	},
	opUsage: {
		titlePadding: 56
	}
});

NBTRecipe(pack, 'book', {
	// TODO: Remove type assertion.
	type: 'minecraft:crafting_shapeless' as 'crafting_shapeless',
	ingredients: [{
		item: 'minecraft:book'
	}, {
		item: 'minecraft:armor_stand'
	}],
	result: {
		item: 'minecraft:written_book',
		nbt: bookNBT
	}
});

onTrigger(pack, 'custom_armor_stands', 'Custom Armor Stands', trigger => {
	const $trigger = trigger('@s');


});

setConfigFunction(pack, () => {

});