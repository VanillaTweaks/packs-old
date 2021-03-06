// This checks for a common error where data packs add a missing function reference to their `#minecraft:load` tag, causing the entire `#minecraft:load` tag to break and become empty for all data packs.

import type { AdvancementInstance, PredicateCondition } from 'sandstone';
import { advancement, Advancement, execute, MCFunction, Predicate, schedule, scoreboard, Tag, tellraw } from 'sandstone';
import vt from 'lib/vt';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import pack from 'lib/pack';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import temp from 'lib/datapacks/temp';
import { scheduleFixMaxCommandChainLength } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';
import { fplTooLowAdvancement } from 'lib/datapacks/faultChecking/checkFunctionPermissionLevel';
import onPlayerJoinOrLoad from 'lib/datapacks/pseudoEvents/onPlayerJoinOrLoad';
import vtNotUninstalled from 'lib/datapacks/faultChecking/vtNotUninstalled';

const loadTagNotLoaded = vt.getChild('load_tag_not_loaded');

const $vtLoadStatus = loadStatusOf(vt);
const $packLoadStatus = loadStatusOf(pack);

/** A score set to 1 when the `warn` is currently `schedule`d. */
const $warnScheduled = temp(`$${loadTagNotLoaded.path}.warnScheduled`);

/** Schedules the `tickTag` to run after 1 tick. */
const scheduleTick = MCFunction(loadTagNotLoaded`_schedule_tick`, () => {
	schedule.function(tickTag, '1t');
});

/** A function tag which runs as close as possible to every tick in case `#minecraft:load` isn't working, using advancement reward functions and `#minecraft:tick`. */
const tickTag = Tag('functions', loadTagNotLoaded`_tick`, [
	// In case the `maxCommandChainLength` is 1 (the minimum value), ensure that only the first command of each function in this tag is necessary for `fixMaxCommandChainLength` to work.
	MCFunction(loadTagNotLoaded`_tick`, () => {
		// Add the `loadStatus` objective, so that `loadStatus` score checks work for the rest of the `tickTag`.
		scoreboard.objectives.add(loadStatus, 'dummy');
	}),
	MCFunction(loadTagNotLoaded`_add_temp_objective`, () => {
		// Add the `temp` objective if VT isn't uninstalled, so that `temp` score checks work for the rest of the `tickTag`.
		execute
			.unless($vtLoadStatus.matches(-1))
			.run.scoreboard.objectives.add(temp, 'dummy');
	}),
	// We schedule the `fixMaxCommandChainLengthTag` instead of running it directly so it can't run multiple times each tick.
	scheduleFixMaxCommandChainLength,
	// The reason `tickTag` is scheduled after `fixMaxCommandChainLengthTag` rather than before is so that, when `tickTag` runs in the next tick, the `maxCommandChainLength` will already have been fixed since `fixMaxCommandChainLengthTag` was scheduled first.
	scheduleTick,
	MCFunction(pack`load_tag_not_loaded/_check`, () => {
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

const warn = MCFunction(loadTagNotLoaded`_warn`, () => {
	schedule.function(warn, `${60 * 2}s`);
	// Replace all `$warnScheduled.target, $warnScheduled.objective` with `$warnScheduled`.
	scoreboard.players.set($warnScheduled.target, $warnScheduled.objective, 1);

	tellraw('@a', [
		'',
		{ text: `At least one of this world's data packs has errors interfering with ${vt.TITLE}. To fix this, `, color: 'red' },
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

/** The number of tick trial advancements to add (not counting the root). */
const TRIAL_ADVANCEMENT_COUNT = 24;
/** The chance that each tick trial advancement is granted each tick is 1 in this value. */
const INVERSE_CHANCE = 12000;

let rootTickTrialAdvancement: AdvancementInstance;

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
						[fplTooLowAdvancement.name]: true
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
	// TODO: Remove `.name`.
	]).name
};

for (let i = 0; i <= TRIAL_ADVANCEMENT_COUNT; i++) {
	const tickTrialAdvancement = Advancement(loadTagNotLoaded`tick_trials/${i === 0 ? 'root' : i}`, {
		...i !== 0 && {
			parent: rootTickTrialAdvancement!
		},
		criteria: {
			tick: {
				trigger: 'minecraft:tick',
				conditions: {
					// Add randomized time delays to all tick trial advancements but the root, because if the `function-permission-level` was previously too low, then the root tick trial advancement would have been granted to all online players with no means of being revoked.
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

	if (i === 0) {
		rootTickTrialAdvancement = tickTrialAdvancement;
	}
}

onPlayerJoinOrLoad(loadTagNotLoaded, () => {
	// If this runs, then `#minecraft:load` is working now.
	// Thus, optimize by granting the tick trial advancements so they stops running their checks.
	advancement.grant('@s').from(rootTickTrialAdvancement);
});

onUninstall(loadTagNotLoaded, () => {
	// Revoke the tick trial advancements from everyone online, to maximize the chance of one of them initiating the `tickTag` schedule again after a reload.
	advancement.revoke('@a').from(rootTickTrialAdvancement);
});

/** Given `TRIAL_ADVANCEMENT_COUNT`, `INVERSE_CHANCE`, `MIN_TIME`, and `MAX_TIME`, simulates and logs the average times in minutes that it takes for a randomized tick trial advancement to be granted after the `fplTooLowAdvancement` is granted, as well as the percentage of players who are granted any tick trial advancement in the specified range of time. */
const simulateTickTrials = () => {
	/** The minimum number of ticks while the player is online that it can take for any tick trial advancement to be granted after the `function-permission-level` is fixed in order for a trial to count as successful. */
	const MIN_TIME = 20 * 60 * 5;
	/** The maximum number of ticks while the player is online that it can take for any tick trial advancement to be granted after the `function-permission-level` is fixed in order for a trial to count as successful. */
	const MAX_TIME = MIN_TIME + 20 * 60 * 3;

	const TRIALS = 1000;
	/** The chances that each tick trial advancement is granted each tick. */
	const CHANCES = [...new Array(TRIAL_ADVANCEMENT_COUNT)].map(() => 1 / INVERSE_CHANCE);

	let firstGrantTimeSum = 0;
	let lastGrantTimeSum = 0;
	let successes = 0;

	for (let i = 0; i < TRIALS; i++) {
		const chances = [...CHANCES];
		let firstGrantTime: number | undefined;
		let lastGrantTime: number | undefined;
		let success = false;

		for (let t = 1; chances.length; t++) {
			for (let j = 0; j < chances.length; j++) {
				if (Math.random() < chances[j]) {
					if (firstGrantTime === undefined) {
						firstGrantTime = t;
					}

					if (t >= MIN_TIME && t <= MAX_TIME) {
						success = true;
					}

					chances.splice(j, 1);
				}
			}

			if (chances.length === 0) {
				lastGrantTime = t;
			}
		}

		firstGrantTimeSum += firstGrantTime!;
		lastGrantTimeSum += lastGrantTime!;
		if (success) {
			successes++;
		}
	}

	console.log({
		first: firstGrantTimeSum / TRIALS / 20 / 60,
		last: lastGrantTimeSum / TRIALS / 20 / 60,
		successRate: 100 * successes / TRIALS
	});
};

const shouldSimulateLogTickTrials = false as boolean;
if (shouldSimulateLogTickTrials) {
	simulateTickTrials();
}