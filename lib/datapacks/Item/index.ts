import type { BaseLocationInstance } from 'lib/BaseLocation';
import type { ITEMS, LiteralUnion, LootTableInstance, NBTObject, RootNBT } from 'sandstone';
import { LootTable, NBT } from 'sandstone';
import vt from 'lib/vt';

export type ItemOptions = {
	/** The namespaced ID of the real item which the custom item extends. */
	item: LiteralUnion<ITEMS>,
	/**
	 * The item's NBT.
	 *
	 * Automatically merged with the following:
	 *
	 * ```
	 * {
	 * 	data: {
	 * 		[vt.NAMESPACE]: {
	 * 			item: item.name
	 * 		}
	 * 	}
	 * }
	 * ```
	 */
	nbt: RootNBT & {
		CustomModelData: number,
		data?: {
			[namespace: string]: NBTObject | undefined,
			[vt.NAMESPACE]?: {
				item?: never
			}
		}
	}
};

export type ItemInstance = {
	baseLocation: BaseLocationInstance,
	/**
	 * The namespaced name of the custom item.
	 *
	 * Example: `` pack`wrench` ``
	 */
	name: string,
	/**
	 * The non-namespaced name of the custom item.
	 *
	 * Example: `'wrench'`
	 */
	nameWithoutBase: string,
	lootTable: LootTableInstance,
	toString: () => string
};

/** Creates an abstraction for a custom NBT item. */
const Item = (
	/** The `BaseLocation` under which to create the necessary directories and resources for the item. */
	baseLocation: BaseLocationInstance,
	/** The non-namespaced name of the item. */
	nameWithoutBase: string,
	options: ItemOptions
) => {
	const name = baseLocation`${nameWithoutBase}`;

	const items = baseLocation.getChild('items');

	const lootTable = LootTable(items`${nameWithoutBase}`, {
		type: 'minecraft:command',
		pools: [{
			rolls: 1,
			entries: [{
				type: 'minecraft:item',
				name: options.item,
				functions: [{
					// TODO: Remove type assertion.
					function: 'minecraft:set_nbt' as 'set_nbt',
					tag: NBT.stringify({
						...options.nbt,
						data: {
							...options.nbt.data,
							[vt.NAMESPACE]: {
								...options.nbt.data?.[vt.NAMESPACE],
								item: name
							}
						}
					})
				}]
			}]
		}]
	});

	const item: ItemInstance = {
		baseLocation,
		name,
		nameWithoutBase,
		lootTable,
		toString: () => item.name
	};

	return item;
};

export default Item;