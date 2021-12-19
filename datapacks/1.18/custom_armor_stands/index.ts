import onTrigger from 'lib/datapacks/onTrigger';
import pack from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/pack/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import book from './book';
import { triggerChat } from './chat';

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

	triggerChat($trigger);
});

setConfigFunction(pack, () => {

});