// This checks for a common error where data packs add a missing function reference to their `#minecraft:load` tag, causing the entire `#minecraft:load` tag to break and become empty for all data packs.

import { execute, MCFunction, schedule, scoreboard, tellraw } from 'sandstone';
import pack from 'lib/datapacks/pack';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';
import onAdvancementTick from 'lib/datapacks/pseudoEvents/onAdvancementTick';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import temp from 'lib/datapacks/temp';
import { loadStatus } from 'lib/datapacks/lanternLoad';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

const loadTagNotLoaded = vt.child({ directory: 'load_tag_not_loaded' });
const loadTagNotLoaded_ = internalBasePath(loadTagNotLoaded);

/** A score set to 1 when the `warn` function is currently `schedule`d. */
const $warnScheduled = temp(`$${loadTagNotLoaded.directory}.warnScheduled`);

const warn = MCFunction(loadTagNotLoaded_`warn`, () => {
	schedule.function(warn, `${60 * 2}s`);
	// Replace all `$warnScheduled.target, $warnScheduled.objective` with `$warnScheduled`.
	scoreboard.players.set($warnScheduled.target, $warnScheduled.objective, 1);

	tellraw('@a', [
		'',
		{ text: 'TODO', color: 'red' }
	]);
});

const $packLoadStatus = loadStatusOf(pack);

onAdvancementTick(pack, () => {
	// Add the `loadStatus` objective in case `#minecraft:load` never got a chance to add it, so that the below score check works.
	// TODO: Remove `.name` below.
	scoreboard.objectives.add(loadStatus.name, 'dummy');

	// This method is unfortunately not foolproof, since it's possible that every pack's `loadStatus` could have been set by a past load despite the `#minecraft:load` tag currently being broken, but it's a lot better than nothing.
	execute
		// Don't warn if it's 0 (uninstalled) or 1 (loaded).
		// TODO: Remove `as any`.
		.unless($packLoadStatus.matches('0..1' as any))
		// Don't warn if there was already a recent warning.
		.unless($warnScheduled.matches(1))
		.run(warn);
});

onLoad(loadTagNotLoaded, () => {
	// If this runs, then `#minecraft:load` is working now.

	schedule.clear(warn);
	scoreboard.players.set($warnScheduled.target, $warnScheduled.objective, 0);
});

onUninstall(loadTagNotLoaded, () => {
	schedule.clear(warn);
});