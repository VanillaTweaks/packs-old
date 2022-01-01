// This checks for a common error where data packs reference missing functions in their `#minecraft:load` tag, causing the entire `#minecraft:load` tag to break and become empty for all data packs.

import { execute, tag } from 'sandstone';
import pack from 'lib/datapacks/pack';
import loadStatusScore from 'lib/datapacks/lanternLoad/loadStatusScore';
import onAdvancementTick from 'lib/datapacks/pseudoEvents/onAdvancementTick';

const $packLoadStatus = loadStatusScore(pack);

onAdvancementTick(pack, () => {
	// TODO: Replace all `packNotLoaded` with `` pack`.notLoaded` ``.
	const packNotLoaded = `${pack.namespace}.notLoaded`;

	tag('@s').add(packNotLoaded);

	// The reason we can't just `execute.unless(...).run(...)` without the tag is because then it won't run if the `loadStatus` objective does not exist, which is likely if the `loadTag` is broken.
	execute
		.if($packLoadStatus.matches(1))
		.run.tag('@s').remove(packNotLoaded);
	execute
		.if.entity(`@s[tag=${packNotLoaded}]`)
		.run

	tag('@s').remove(packNotLoaded);
});