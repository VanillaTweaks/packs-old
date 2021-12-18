import onTrigger from 'lib/datapacks/onTrigger';
import pack from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/pack/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import horizontalBar from 'lib/datapacks/textComponents/horizontalBar';
import pageHead from 'lib/datapacks/textComponents/pageHead';
import { execute } from 'sandstone';
import book from './book';

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

onTrigger(pack, 'custom_armor_stands', 'Custom Armor Stands', trigger => {
	const $trigger = trigger('@s');

	execute
		.if($trigger.matches(1))
		.run(() => {
			pageHead({
				spaces: 19,
				subtitle: 'Main Menu'
			});



			horizontalBar();
		});
});

setConfigFunction(pack, () => {

});