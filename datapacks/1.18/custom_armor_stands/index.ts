import pack from 'lib/datapacks/pack';
import setMetaAdvancements from 'lib/datapacks/pack/setMetaAdvancements';
import setConfigFunction from 'lib/datapacks/setConfigFunction';
import onUninstall from 'lib/datapacks/onUninstall';
import onLoad from 'lib/datapacks/onLoad';
import every from 'lib/datapacks/every';
import book from './book';

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

onLoad(pack, () => {

});

every('1t', pack, () => {

});

onUninstall(pack, () => {

});

setConfigFunction(pack, () => {

});