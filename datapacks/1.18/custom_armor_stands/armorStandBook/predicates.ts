import pack from 'lib/pack';
import vt from 'lib/vt';
import { NBT, Predicate } from 'sandstone';
import type { ItemCriterion } from 'sandstone/arguments/resources/criteria';
import armorStandBook from '.';

const armorStandBookCriterion: ItemCriterion = {
	items: ['minecraft:written_book'],
	nbt: NBT.stringify({
		data: {
			[vt.NAMESPACE]: {
				item: armorStandBook.name
			}
		}
	})
};

export const bookInMainhand = Predicate(pack`armor_stand_book/in_mainhand`, {
	condition: 'minecraft:entity_properties',
	entity: 'this',
	predicate: {
		equipment: {
			mainhand: armorStandBookCriterion
		}
	}
});

export const bookInOffhand = Predicate(pack`armor_stand_book/in_offhand`, {
	condition: 'minecraft:entity_properties',
	entity: 'this',
	predicate: {
		equipment: {
			offhand: armorStandBookCriterion
		}
	}
});