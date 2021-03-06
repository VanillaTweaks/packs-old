import vt from 'lib/vt';
import { Advancement, NBT } from 'sandstone';
import type { AdvancementJSON, JSONTextComponent } from 'sandstone';
import pack from 'lib/pack';
import { color, minify, whitespace } from 'minecraft-text-components';
import beforeSave from 'lib/beforeSave';

/** Whether the `pack` has an uninstall function. */
let hasUninstallFunction = false;
/**
 * Sets whether the `pack` has an uninstall function.
 *
 * ⚠️ Should only be called by `onUninstall`.
 */
export const setHasUninstallFunction = (newValue: boolean) => {
	hasUninstallFunction = newValue;
};

/** Whether the `pack` has a config function. */
let hasConfigFunction = false;
/**
 * Sets whether the `pack` has a config function.
 *
 * ⚠️ Should only be called by `setConfigFunction`.
 */
export const setHasConfigFunction = (newValue: boolean) => {
	hasConfigFunction = newValue;
};

type MetaAdvancementOptions = {
	/** The number of in-game pixels of whitespace to add after the title, so the advancement's description isn't so squished. */
	titlePadding?: number,
	/** The advancement's description, with gold as the default color. */
	description: JSONTextComponent
};

type AdvancementIcon = NonNullable<AdvancementJSON['display']>['icon'];

type MetaAdvancementJSON = {
	icon: AdvancementIcon,
	title: string
};

const metaAdvancementsJSON = {
	usage: {
		icon: {
			item: 'minecraft:book'
		},
		title: 'How to Use'
	} as MetaAdvancementJSON,
	opUsage: {
		icon: {
			item: 'minecraft:command_block'
		},
		title: 'Admin Info'
	} as MetaAdvancementJSON
} as const;

/** Sets the info for the pack listed under a VT advancement tab. */
const setMetaAdvancements = (options: {
	root: MetaAdvancementOptions & {
		icon: AdvancementIcon
	},
	usage?: MetaAdvancementOptions,
	// `MetaAdvancementOptions` is `Partial` to make `description` optional, since `opUsage` meta advancements often have a description by default.
	opUsage?: Partial<MetaAdvancementOptions>
}) => {
	let advancementIndex = 1;

	let lastAdvancement = Advancement(pack`meta/${advancementIndex++}`, {
		display: {
			icon: options.root.icon,
			title: minify([
				pack.TITLE,
				whitespace(options.root.titlePadding || 0)
			]),
			description: color('gold', options.root.description),
			show_toast: false,
			announce_to_chat: false
		},
		parent: Advancement(vt`meta/root`, {
			display: {
				icon: {
					item: 'minecraft:player_head',
					nbt: NBT.stringify({
						SkullOwner: {
							Id: NBT.intArray([-1422064857, -1009957322, -2144021055, 1028438231]),
							Properties: {
								textures: [{
									Value: 'eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNWQ2OWYzZGRlMzRmMmE0NzhkZDMxNjk5ODAzMmNkM2E0MTBkZDdmOThhYzU0OTRhZTUwYjBmNmY1ZmI5OGQyOCJ9fX0='
								}]
							}
						}
					})
				},
				title: vt.TITLE,
				frame: 'challenge',
				description: [
					{ text: `All loaded ${vt.TITLE} data packs\n`, color: 'gold' },
					{ text: 'vanillatweaks.net', color: 'yellow' }
				],
				background: 'minecraft:textures/block/black_concrete.png',
				show_toast: false,
				announce_to_chat: false
			},
			criteria: {
				tick: {
					trigger: 'minecraft:tick'
				}
			}
		}),
		criteria: {
			tick: {
				trigger: 'minecraft:tick'
			}
		}
	});

	beforeSave(() => {
		if (hasUninstallFunction || hasConfigFunction) {
			// Automatically update the `opUsage` meta advancement.

			if (!options.opUsage) {
				options.opUsage = {};
			}

			if (!Array.isArray(options.opUsage.description)) {
				options.opUsage.description = [
					options.opUsage.description || ''
				];
			}

			if (hasConfigFunction) {
				options.opUsage.description.push(
					{
						text: (
							(options.opUsage.description.length > 1 ? '\n\n' : '')
							+ `/function ${pack`config`}`
						),
						color: 'yellow'
					},
					'\nConfigure the data pack.'
				);
			}

			if (hasUninstallFunction) {
				options.opUsage.description.push(
					{
						text: (
							(options.opUsage.description.length > 1 ? '\n\n' : '')
							+ `/function ${pack`uninstall`}`
						),
						color: 'yellow'
					},
					'\nUninstall the data pack.'
				);
			}
		}

		for (const metaAdvancementKey of Object.keys(metaAdvancementsJSON) as Array<keyof typeof metaAdvancementsJSON>) {
			const advancementOptions = options[metaAdvancementKey] as MetaAdvancementOptions | undefined;

			if (advancementOptions) {
				const metaAdvancementType = metaAdvancementsJSON[metaAdvancementKey];

				lastAdvancement = Advancement(pack`meta/${advancementIndex++}`, {
					display: {
						icon: metaAdvancementType.icon,
						title: minify([
							metaAdvancementType.title,
							whitespace(advancementOptions.titlePadding || 0)
						]),
						description: color('gold', advancementOptions.description),
						show_toast: false,
						announce_to_chat: false
					},
					parent: lastAdvancement,
					criteria: {
						tick: {
							trigger: 'minecraft:tick'
						}
					}
				});
			}
		}
	});
};

export default setMetaAdvancements;