import vt from 'lib/vt';
import { NBT } from 'sandstone';
import armorStandBook from '../armorStandBook';

export const lecternWithArmorStandBookSNBT = NBT.stringify({
	Book: {
		tag: {
			data: {
				[vt.NAMESPACE]: {
					item: armorStandBook.name
				}
			}
		}
	}
});

/** A block ID with armor stand book NBT. */
export const lecternWithArmorStandBook = `minecraft:lectern${lecternWithArmorStandBookSNBT}`;