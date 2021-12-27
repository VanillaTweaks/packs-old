import type { loot } from 'sandstone';
import { execute } from 'sandstone';
import temp from 'lib/datapacks/temp';

const $lootGiveResult = temp('$lootGiveResult');

/**
 * Gives `@s` a loot table, working around https://bugs.mojang.com/browse/MC-154422 by first trying `/loot give` and then falling back to `/loot spawn`.
 *
 * ⚠️ Assumes its commands are being executed `at @s`.
 */
const giveLootTable = (
	lootTable: Parameters<ReturnType<typeof loot['give']>['loot']>[0]
) => {
	execute
		.store.result.score($lootGiveResult)
		.run.loot.give('@s').loot(lootTable);
	execute
		.if($lootGiveResult.matches(0))
		.anchored('eyes')
		// TODO: Replace `['^', '^', '^']` with `'^ ^ ^'`.
		.run.loot.spawn(['^', '^', '^']).loot(lootTable);
};

export default giveLootTable;