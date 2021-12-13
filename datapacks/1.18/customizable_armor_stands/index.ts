import pack, { pack_ } from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/pack/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import onUninstall from 'lib/datapacks/onUninstall';
import onLoad from 'lib/datapacks/onLoad';
import every from 'lib/datapacks/every';

setMetaAdvancements({
	root: {
		icon: {
			item: 'minecraft:armor_stand'
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

onLoad(pack, () => {

});

every(pack, '1t', () => {

});

onUninstall(pack, () => {

});

setConfigFunction(pack, () => {

});