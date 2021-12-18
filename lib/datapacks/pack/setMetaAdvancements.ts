import vt from 'lib/datapacks/vt';
import state from 'lib/datapacks/state';
import { Advancement, NBT } from 'sandstone';
import type { AdvancementJSON, JSONTextComponent } from 'sandstone';
import pack from 'lib/datapacks/pack';
import padding from '../textComponents/padding';
import minifyComponent from '../textComponents/minifyComponent';

type MetaAdvancementOptions = {
	/** The number of spaces after the title, so the advancement's description isn't so squished. */
	titlePadding?: number,
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
	// `MetaAdvancementOptions` is `Partial` to make `description` optional, since `opUsage` meta advancements often have a description by default.
	opUsage?: Partial<MetaAdvancementOptions>
}) => {
	let advancementIndex = 1;

	// TODO: Use `pack` as a template tag.
	let lastAdvancement = pack.Advancement(`meta/${advancementIndex++}`, {
		display: {
			icon: options.root.icon,
			title: minifyComponent([
				pack.title,
				padding(options.root.titlePadding || 0)
			]),
			description: options.root.description,
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
			// Automatically update the `opUsage` meta advancement.

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
					{ text: '\nConfigure the data pack.', color: 'gold' }
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
					{ text: '\nUninstall the data pack.', color: 'gold' }
				);
			}
		}

		for (const metaAdvancementKey of Object.keys(metaAdvancementsJSON) as Array<keyof typeof metaAdvancementsJSON>) {
			const advancementOptions = options[metaAdvancementKey] as MetaAdvancementOptions | undefined;

			if (advancementOptions) {
				const metaAdvancementType = metaAdvancementsJSON[metaAdvancementKey];

				// TODO: Use `pack` as a template tag.
				lastAdvancement = pack.Advancement(`meta/${advancementIndex++}`, {
					display: {
						icon: metaAdvancementType.icon,
						title: minifyComponent([
							metaAdvancementType.title,
							padding(advancementOptions.titlePadding || 0)
						]),
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