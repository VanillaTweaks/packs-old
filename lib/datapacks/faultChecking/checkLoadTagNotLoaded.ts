// This checks for a common error where data packs add a missing function reference to their `#minecraft:load` tag, causing the entire `#minecraft:load` tag to break and become empty for all data packs.

import { advancement, Advancement, execute, MCFunction, schedule, scoreboard, Tag, tellraw } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import pack, { pack_ } from 'lib/datapacks/pack';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import temp from 'lib/datapacks/temp';
import { scheduleFixMaxCommandChainLength } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';

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

		// Revoke the advancement from everyone so it has the greatest chance of being granted again in the event that `tickTag` stops running (e.g. due to VT being uninstalled).
		advancement.revoke('@a').only(tickAdvancement);
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

/** An advancement granted to all players and revoked every tick (or as close thereto as possible). */
const tickAdvancement = Advancement(loadTagNotLoaded`tick`, {
	criteria: {
		tick: {
			trigger: 'minecraft:tick',
			conditions: {
				player: [{
					condition: 'minecraft:inverted',
					term: {
						condition: 'minecraft:value_check',
						value: {
							type: 'minecraft:score',
							target: {
								type: 'minecraft:fixed',
								name: $vtLoadStatus.target.toString()
							},
							score: $vtLoadStatus.objective
						},
						// Ensure VT is not uninstalled, since otherwise the `warn` function could run even after everything is supposed to be uninstalled.
						range: -1
						// TODO: Remove `as any`.
					} as any
				}]
			}
		}
	},
	rewards: {
		// The reason we schedule `tickTag` instead of calling it directly is because, otherwise, the `function` command would count toward the `maxCommandChainLength`, preventing anything inside the function tag from running.
		// Additionally, scheduling it makes it only run once rather than for each player.
		function: scheduleTick
	}
});