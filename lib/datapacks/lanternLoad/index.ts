// A faithful implementation of https://github.com/LanternMC/load.

import { MCFunction, Objective, scoreboard, Tag } from 'sandstone';
import ResourceLocation from 'lib/datapacks/ResourceLocation';
import { loadTempObjective } from 'lib/datapacks/temp';
import { fixMaxCommandChainLengthTag } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';

const lanternLoad = ResourceLocation('load', { external: true });

const preLoadTag = Tag('functions', lanternLoad`pre_load`, [
	loadTempObjective,
	fixMaxCommandChainLengthTag
]);

export const loadTag = Tag('functions', lanternLoad`load`);

/** The [Lantern Load `load.status` objective](https://github.com/LanternMC/load#pack-versioning-specification). */
export const loadStatus = Objective.get(lanternLoad`.status`);

Tag('functions', lanternLoad`_private/load`, [
	Tag('functions', lanternLoad`_private/init`, [
		MCFunction(lanternLoad`_private/init`, () => {
			scoreboard.objectives.add(loadStatus, 'dummy');
			scoreboard.players.reset('*', loadStatus);
		})
	]),
	{ id: preLoadTag, required: false },
	{ id: loadTag, required: false },
	{ id: lanternLoad`#post_load`, required: false }
], {
	runOnLoad: true
});