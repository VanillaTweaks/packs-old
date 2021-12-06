import { VT } from 'lib/datapacks/vanillatweaks';
import state from 'lib/datapacks/state';
import { NBT } from 'sandstone';
import type { AdvancementJSON, JSONTextComponent } from 'sandstone';
import pack from 'lib/datapacks/pack';

type MetaAdvancementOptions = {
	/** The number of spaces after the title, so the advancement's description isn't so squished. */
	titleSpaces?: number,
	description: JSONTextComponent & ['', ...unknown[]]
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

/** Sets the info for the pack listed in the advancements under a Vanilla Tweaks section. */
const setMetaAdvancements = (options: {
	root: MetaAdvancementOptions & {
		icon: AdvancementIcon
	},
	usage?: MetaAdvancementOptions,
	// `MetaAdvancementOptions` is `Partial`ed to make `description` optional, since `opUsage` meta advancements often have a description by default.
	opUsage?: Partial<MetaAdvancementOptions>
}) => {
	let advancementIndex = 1;

	let lastAdvancement = pack.Advancement(`meta/${advancementIndex++}`, {
		display: {
			icon: options.root.icon,
			title: pack.title + ' '.repeat(options.root.titleSpaces || 0),
			description: options.root.description,
			show_toast: false,
			announce_to_chat: false
		},
		parent: VT.Advancement('meta/0', {
			display: {
				icon: {
					item: 'minecraft:player_head',
					nbt: NBT.stringify({
						SkullOwner: NBT.intArray([0, 0, 0, 0]),
						Properties: {
							textures: [{
								Value: 'eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMTg1YzMzNWM1MjVjZGFkY2Q4MmU4MDA4MzU1N2M2OTYzMGRmYjlhMWVkZjU5OTc0YzdmNjU4ZGI1MWEwYTFkOSJ9fX0='
							}]
						}
					})
				},
				title: 'Vanilla Tweaks',
				frame: 'challenge',
				description: [
					'',
					{ text: 'All loaded Vanilla Tweaks data packs\n', color: 'gold' },
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

	state.finishFunctions.push(() => {
		if (state.hasUninstallFunction || state.hasConfigFunction) {
			// Automatically update `opUsage` meta advancement.

			if (!options.opUsage) {
				options.opUsage = {};
			}

			if (!options.opUsage.description) {
				options.opUsage.description = [
					''
				];
			}

			if (state.hasConfigFunction) {
				options.opUsage.description.push(
					{
						text: (
							(options.opUsage.description.length > 1 ? '\n\n' : '')
							+ `/function ${pack`config`}`
						),
						color: 'yellow'
					},
					{ text: '\nConfigure the data pack', color: 'gold' }
				);
			}

			if (state.hasUninstallFunction) {
				options.opUsage.description.push(
					{
						text: (
							(options.opUsage.description.length > 1 ? '\n\n' : '')
							+ `/function ${pack`uninstall`}`
						),
						color: 'yellow'
					},
					{ text: '\nUninstall the data pack', color: 'gold' }
				);
			}
		}

		for (const metaAdvancementKey of Object.keys(metaAdvancementsJSON)) {
			const advancementOptions = options[metaAdvancementKey as keyof typeof metaAdvancementsJSON] as MetaAdvancementOptions | undefined;

			if (advancementOptions) {
				const metaAdvancementType = metaAdvancementsJSON[metaAdvancementKey as keyof typeof metaAdvancementsJSON];

				lastAdvancement = pack.Advancement(`meta/${advancementIndex++}`, {
					display: {
						icon: metaAdvancementType.icon,
						title: metaAdvancementType.title + ' '.repeat(advancementOptions.titleSpaces || 0),
						description: advancementOptions.description,
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