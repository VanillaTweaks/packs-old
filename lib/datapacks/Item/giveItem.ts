import type { ItemInstance } from 'lib/datapacks/Item';
import giveLootTable from 'lib/datapacks/giveLootTable';

/**
 * Gives `@s` an `Item`.
 *
 * ⚠️ Assumes it is being executed `at @s`.
 */
const giveItem = (item: ItemInstance) => {
	giveLootTable(item.lootTable);
};

export default giveItem;