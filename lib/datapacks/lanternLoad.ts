// A faithful implementation of https://github.com/LanternMC/load for Vanilla Tweaks.

import { MCFunction, scoreboard, Tag } from 'sandstone';
import VTBasePath from 'lib/datapacks/VTBasePath';
import checkMaxCommandChainLength from 'lib/datapacks/checkMaxCommandChainLength';
import { loadTempObjective } from 'lib/datapacks/temp';

const lanternLoad = VTBasePath({ namespace: 'load' });

export const preLoadTag = Tag('functions', lanternLoad`pre_load`, [
	// Add the `temp` objective so it can be used in `checkMaxCommandChainLength`.
	loadTempObjective,
	checkMaxCommandChainLength
]);

export const loadTag = Tag('functions', lanternLoad`load`);

Tag('functions', lanternLoad`_private/load`, [
	Tag('functions', lanternLoad`_private/init`, [
		MCFunction(lanternLoad`_private/init`, () => {
			// TODO: Replace both instances of `'load.status'` below with `` lanternLoad`.status` ``.
			scoreboard.objectives.add('load.status', 'dummy');
			scoreboard.players.reset('*', 'load.status');
		})
	]),
	{ id: preLoadTag, required: false },
	{ id: loadTag, required: false },
	// TODO: Remove `'#' + ` and change `post_load` to `#post_load`.
	{ id: '#' + lanternLoad`post_load`, required: false }
], {
	runOnLoad: true
});