// This checks for a common error where data packs add a missing function reference to their `#minecraft:load` tag, causing the entire `#minecraft:load` tag to break and become empty for all data packs.

import type { PredicateCondition } from 'sandstone';
import { advancement, Advancement, execute, MCFunction, Predicate, schedule, scoreboard, Tag, tellraw } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import pack, { pack_ } from 'lib/datapacks/pack';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import temp from 'lib/datapacks/temp';
import { scheduleFixMaxCommandChainLength } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';
import { fplTooLowAdvancement } from 'lib/datapacks/faultChecking/checkFunctionPermissionLevel';
import onPlayerJoinOrLoad from 'lib/datapacks/pseudoEvents/onPlayerLoadOrJoin';
import vtNotUninstalled from 'lib/datapacks/faultChecking/vtNotUninstalled';

const loadTagNotLoaded = vt.child({ directory: 'load_tag_not_loaded' });
const loadTagNotLoaded_ = internalBasePath(loadTagNotLoaded);

const $vtLoadStatus = loadStatusOf(vt);
const $packLoadStatus = loadStatusOf(pack);

/** A score set to 1 when the `warn` is currently `schedule`d. */
const $warnScheduled = temp(`$${loadTagNotLoaded.directory}.warnScheduled`);

/** Schedules the `tickTag` to run after 1 tick. */
const scheduleTick = MCFunction(loadTagNotLoaded_`schedule_tick`, () => {
	schedule.function(tickTag, '1t');
});

/** A function tag which runs as close as possible to every tick in case `#minecraft:load` isn't working, using advancement reward functions and `#minecraft:tick`. */
const tickTag = Tag('functions', loadTagNotLoaded_`tick`, [
	// In case the `maxCommandChainLength` is 1 (the minimum value), ensure that only the first command of each function in this tag is necessary for `fixMaxCommandChainLength` to work.
	MCFunction(loadTagNotLoaded_`tick`, () => {
		// Add the `loadStatus` objective, so that `loadStatus` score checks work for the rest of the `tickTag`.
		scoreboard.objectives.add(loadStatus.name, 'dummy');
	}),
	MCFunction(loadTagNotLoaded_`add_temp_objective`, () => {
		// Add the `temp` objective if VT isn't uninstalled, so that `temp` score checks work for the rest of the `tickTag`.
		execute
			.unless($vtLoadStatus.matches(-1))
			// TODO: Remove `.name` below.
			.run.scoreboard.objectives.add(temp.name, 'dummy');
	}),
	// We schedule the `fixMaxCommandChainLengthTag` instead of running it directly so it can't run multiple times each tick.
	scheduleFixMaxCommandChainLength,
	// The reason `tickTag` is scheduled after `fixMaxCommandChainLengthTag` rather than before is so that, when `tickTag` runs in the next tick, the `maxCommandChainLength` will already have been fixed since `fixMaxCommandChainLengthTag` was scheduled first.
	scheduleTick,
	MCFunction(pack_`load_tag_not_loaded/check`, () => {
		// This method is unfortunately not foolproof, since it's possible that every pack's `loadStatus` could have been set by a past load despite the `#minecraft:load` tag currently being broken, but it covers most practical cases.
		execute
			// Don't warn if the pack's `loadStatus` is -1 (uninstalled) or 1 (loaded). We want to detect when it's installed but not loaded.
			// TODO: Remove `as any`.
			.unless($packLoadStatus.matches('-1..1' as any))
			// Don't warn if there was already a recent warning.
			.unless($warnScheduled.matches(1))
			.run(warn);
	})
], {
	// We `runOnLoad` because, although this function tag is only useful when `#minecraft:load` is broken, starting to run this tag from `#minecraft:load` maximizes the chance it will still be running when `#minecraft:load` is broken later.
	runOnLoad: true
});

Tag('functions', 'minecraft:tick', [
	// We schedule the `tickTag` instead of running it directly so it can't run multiple times each tick.
	scheduleTick
], { onConflict: 'append' });

onUninstall(loadTagNotLoaded, () => {
	schedule.clear(tickTag);
});

const HELP_URL = 'https://vanillatweaks.net/help/load-tag-not-loaded';

const warn = MCFunction(loadTagNotLoaded_`warn`, () => {
	schedule.function(warn, `${60 * 2}s`);
	// Replace all `$warnScheduled.target, $warnScheduled.objective` with `$warnScheduled`.
	scoreboard.players.set($warnScheduled.target, $warnScheduled.objective, 1);

	tellraw('@a', [
		'',
		{ text: `At least one of this world's data packs has errors interfering with ${vt.title}. To fix this, `, color: 'red' },
		{
			text: 'click here',
			color: 'gold',
			hoverEvent: {
				action: 'show_text',
				contents: [
					'',
					{ text: 'Click to open ', color: 'gray' },
					HELP_URL.replace('https://', ''),
					{ text: '.', color: 'gray' }
				]
			},
			clickEvent: { action: 'open_url', value: HELP_URL }
		},
		{ text: '.', color: 'red' }
	]);
});

const scheduleClearWarnTag = () => {
	schedule.clear(warn);
	scoreboard.players.set($warnScheduled.target, $warnScheduled.objective, 0);
};

onLoad(loadTagNotLoaded, () => {
	// If this runs, then `#minecraft:load` is working now.

	scheduleClearWarnTag();
});

onUninstall(loadTagNotLoaded, () => {
	scheduleClearWarnTag();
});

/** The number of tick trialing advancements to add. */
const ADVANCEMENT_TRIALS = 8;
/** The chance that each tick trialing advancement is granted each tick is 1 in this value. */
const INVERSE_CHANCE = 12000;

const tickTrialAdvancementChance: PredicateCondition = {
	condition: 'minecraft:reference',
	name: Predicate(loadTagNotLoaded`tick_trials/chance`, [
		vtNotUninstalled,
		{
			condition: 'minecraft:entity_properties',
			entity: 'this',
			predicate: {
				player: {
					advancements: {
						[fplTooLowAdvancement.toString()]: true
					}
				}
			}
		},
		{
			condition: 'minecraft:value_check',
			value: {
				type: 'minecraft:uniform',
				min: 0,
				max: INVERSE_CHANCE
			},
			range: 0
		// TODO: Remove `as any`.
		} as any
	// TODO: Remove `.toString()`.
	]).toString()
};

for (let i = 0; i <= ADVANCEMENT_TRIALS; i++) {
	// TODO: Use template tag here.
	const tickTrialAdvancement = Advancement(loadTagNotLoaded.getResourceName(`tick_trials/${i}`), {
		criteria: {
			tick: {
				trigger: 'minecraft:tick',
				conditions: {
					// Add randomized time delays to all tick trialing advancements but the first, because if the `function-permission-level` was previously too low, then the first tick trialing advancement would have been granted to all online players with no means of being revoked.
					// If not for this, the `tickTag` would have no means of running if the `#minecraft:load` and `#minecraft:tick` tags have always been broken, unless a new player who was not online when the `function-permission-level` was too low joins the server.
					// This isn't foolproof, but the chance that it fails given the `function-permission-level` is fixed within several minutes after seeing the error message is very low.
					player: i === 0 ? [vtNotUninstalled] : [tickTrialAdvancementChance]
				}
			}
		},
		rewards: {
			// The reason we schedule `tickTag` instead of calling it directly is because, otherwise, the `function` command would count toward the `maxCommandChainLength`, preventing anything inside the function tag from running.
			// Additionally, scheduling it makes it only run once rather than for each player.
			function: scheduleTick
		}
	});

	onPlayerJoinOrLoad(loadTagNotLoaded, () => {
		// If this runs, then `#minecraft:load` is working now.
		// Thus, optimize by granting the tick trialing advancement so it stops running its checks.
		advancement.grant('@s').only(tickTrialAdvancement);
	});

	onUninstall(loadTagNotLoaded, () => {
		// Revoke the advancement from everyone online, to maximize the chance of one of them initiating the `tickTag` schedule again after a reload.
		advancement.revoke('@a').only(tickTrialAdvancement);
	});
}

/** Given `ADVANCEMENT_TRIALS` and `INVERSE_CHANCE`, simulates and logs the average times in minutes that it takes for a randomized tick trialing advancement to be granted after the `fplTooLowAdvancement` is granted. */
const logAverageTickTrialGrantTimes = () => {
	const TRIALS = 1000;
	/** The chance that each tick trialing advancement is granted each tick. */
	const CHANCE = 1 / INVERSE_CHANCE;

	let firstGrantTimeSum = 0;
	let lastGrantTimeSum = 0;

	for (let i = 0; i < TRIALS; i++) {
		let advancementTrialsLeft = ADVANCEMENT_TRIALS;
		let firstGrantTime: number | undefined;
		let lastGrantTime: number | undefined;

		for (let t = 1; advancementTrialsLeft; t++) {
			for (let j = 0; j < advancementTrialsLeft; j++) {
				if (Math.random() < CHANCE) {
					if (firstGrantTime === undefined) {
						firstGrantTime = t;
					}

					advancementTrialsLeft--;
					break;
				}
			}

			if (advancementTrialsLeft === 0) {
				lastGrantTime = t;
			}
		}

		firstGrantTimeSum += firstGrantTime!;
		lastGrantTimeSum += lastGrantTime!;
	}

	console.log({
		first: firstGrantTimeSum / TRIALS / 20 / 60,
		last: lastGrantTimeSum / TRIALS / 20 / 60
	});
};

const shouldLogAverageTickTrialGrantTimes = false as boolean;
if (shouldLogAverageTickTrialGrantTimes) {
	logAverageTickTrialGrantTimes();
}