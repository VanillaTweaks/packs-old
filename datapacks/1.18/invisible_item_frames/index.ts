import setMetaAdvancements from 'lib/datapacks/setMetaAdvancements';
import pack from 'lib/pack';
import { advancement, Advancement, data, execute, kill, MCFunction, NBT, particle, playsound, summon, tag } from 'sandstone';
import every from 'lib/datapacks/every';
import objective from 'lib/datapacks/objective';

setMetaAdvancements({
	root: {
		icon: { item: 'minecraft:item_frame' },
		titlePadding: 36,
		description: 'Shear an item frame to make it invisible.'
	},
	opUsage: {
		titlePadding: 56
	}
});

const id = objective(pack, 'id');
const $lastItemFrameID = id('$last_value');

const mark = MCFunction(pack`_mark`, () => {
	summon('minecraft:marker', '~ ~ ~', { Tags: [pack.marked_frame] });
	tag('@s').add(pack.marked);
	tag('@s').add(pack.no_item);
});

Advancement(pack`summoned`, {
	criteria: {
		summoned: {
			trigger: 'minecraft:summoned_entity',
			conditions: {
				type: 'minecraft:item_frame',
				nbt: NBT.stringify({
					EntityTag: {
						Tags: [pack.invisible]
					}
				})
			// TODO: Remove `as any`.
			} as any
		}
	},
	rewards: {
		function: MCFunction(pack`_place`, () => {
			execute
				.as(`@e[type=minecraft:item_frame,tag=${pack.invisible},tag=!${pack.marked},limit=1]`)
				.at('@s')
				.run(mark);
		})
	}
});

const shearItemFrameAdvancement = Advancement(pack`shear_item_frame`, {
	criteria: {
		sheared: {
			trigger: 'minecraft:player_interacted_with_entity',
			conditions: {
				player: [{
					condition: 'minecraft:entity_properties',
					entity: 'this',
					predicate: {
						flags: {
							is_sneaking: true
						}
					}
				}],
				item: {
					items: ['minecraft:shears']
				},
				entity: {
					type: 'minecraft:item_frame'
				}
			// TODO: Remove `as any`.
			} as any
		}
	},
	rewards: {
		function: MCFunction(pack`_shear_item_frame`, () => {
			advancement.revoke('@s').only(shearItemFrameAdvancement);

			execute
				.as(`@e[type=minecraft:item_frame,distance=..7,nbt=${
					NBT.stringify({
						Item: {
							id: 'minecraft:shears',
							Count: NBT.byte(1)
						}
					})
				}]`)
				.at('@s')
				.run(pack`_make_invisible`, () => {
					tag('@s').add(pack.invisible);
					mark();
					// TODO: Remove `as any`s.
					particle('minecraft:item' as any, 'item_frame', '~ ~ ~', '0.1 0.2 0.1' as any, 0.025, 10);
					playsound('minecraft:entity.sheep.shear', 'master', '@s', '~ ~ ~', 1, 1);
				});
		})
	}
});

every('1t', pack, () => {
	execute
		.as(`@e[type=minecraft:item_frame,tag=!${pack.has_id}]`)
		.store.result.score('@s', id)
		.run.scoreboard.players.add($lastItemFrameID, 1);

	execute
		.as(`@e[type=minecraft:marker,tag=${pack.mark_frame}]`)
		.at('@s')
		.unless.entity(`@e[type=minecraft:item_frame,tag=${pack.invisible},distance=0]`)
		.align('xyz')
		.run(pack`_break`, () => {
			const justDroppedNBT = NBT.stringify({
				PickupDelay: NBT.short(10),
				Item: {
					id: 'minecraft:item_frame',
					Count: NBT.byte(1)
				}
			});
			const hasEntityTagNBT = NBT.stringify({
				Item: {
					tag: {
						EntityTag: {}
					}
				}
			});
			data.merge.entity(`@e[dx=0,dy=0,dz=0,type=minecraft:item,nbt=${justDroppedNBT},nbt=!${hasEntityTagNBT},limit=1]`, {
				Item: {
					tag: {
						display: {
							Name: JSON.stringify([
								{ text: 'Invisible ', italic: false },
								{ translate: 'item.minecraft.item_frame' }
							])
						}
					}
				}
			});

			kill('@s');
		});
});

every('1s', pack, () => {
	execute
		.as(`@e[type=minecraft:item_frame,tag=${pack.invisible},tag=${pack.no_item}]`)
		.store.success.entity('@s', 'Invisible', 'byte', 1)
		.if.data.entity('@s', '{Invisible:0b}');
});