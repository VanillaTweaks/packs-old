// A faithful implementation of https://github.com/LanternMC/load for Vanilla Tweaks.

import { MCFunction, scoreboard, Tag } from 'sandstone';
import VTBasePath from 'lib/datapacks/VTBasePath';

const lanternLoad = VTBasePath({ namespace: 'load' });

export const loadTag = Tag('functions', lanternLoad`load`);

Tag('functions', lanternLoad`_private/load`, [
	Tag('functions', lanternLoad`_private/init`, [
		MCFunction(lanternLoad`_private/init`, () => {
			// Reset scoreboards so packs can set values accurate for current load.
			scoreboard.objectives.add(lanternLoad`.status`, 'dummy');
			scoreboard.players.reset('*', lanternLoad`.status`);
		})
	]),
	{ id: lanternLoad`#pre_load`, required: false },
	{ id: loadTag, required: false },
	{ id: lanternLoad`#post_load`, required: false }
], {
	runOnLoad: true
});