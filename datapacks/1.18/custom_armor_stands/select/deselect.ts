import pack from 'lib/pack';
import { data, MCFunction } from 'sandstone';

/**
 * Deselects the selected armor stand by removing the selection data from the book in storage. Does nothing if no armor stand is selected.
 *
 * It is not necessary to call this before selecting a different armor stand.
 */
const deselect = MCFunction(pack`_deselect`, () => {
	data.remove.storage(pack`main`, `book.data.${pack}.armorStandID`);
});

export default deselect;