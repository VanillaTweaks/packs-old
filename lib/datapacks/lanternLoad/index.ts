// A faithful implementation of https://github.com/LanternMC/load for Vanilla Tweaks.

import { MCFunction, Objective, scoreboard, Tag } from 'sandstone';
import VTBasePath from 'lib/datapacks/VTBasePath';
import { addTempObjective } from 'lib/datapacks/temp';
import { fixMaxCommandChainLengthTag } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';

const lanternLoad = VTBasePath({ namespace: 'load' });

const preLoadTag = Tag('functions', lanternLoad`pre_load`, [
	addTempObjective,
	fixMaxCommandChainLengthTag
]);

export const loadTag = Tag('functions', lanternLoad`load`);

/** The [Lantern Load `load.status` objective](https://github.com/LanternMC/load#pack-versioning-specification). */
// TODO: Replace `'load.status'` with `` lanternLoad`.status` ``.
export const loadStatus = Objective.get('load.status');

Tag('functions', lanternLoad`_private/load`, [
	Tag('functions', lanternLoad`_private/init`, [
		MCFunction(lanternLoad`_private/init`, () => {
			// TODO: Remove both instances of `.name` below.
			scoreboard.objectives.add(loadStatus.name, 'dummy');
			scoreboard.players.reset('*', loadStatus.name);
		})
	]),
	{ id: preLoadTag, required: false },
	{ id: loadTag, required: false },
	// TODO: Remove `'#' + ` and change `post_load` to `#post_load`.
	{ id: '#' + lanternLoad`post_load`, required: false }
], {
	runOnLoad: true
});