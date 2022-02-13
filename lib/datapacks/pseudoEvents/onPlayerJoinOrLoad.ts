import type { MCFunctionInstance, TagInstance } from 'sandstone';
import { execute, MCFunction, scoreboard, Tag } from 'sandstone';
import every from 'lib/datapacks/every';
import vt from 'lib/vt';
import objective from 'lib/datapacks/objective';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import type { BaseLocationInstance } from 'lib/BaseLocation';

const playerJoinOrLoad = vt.getChild('player_join_or_load');

const counter = objective(playerJoinOrLoad, 'counter');
const $globalCounter = counter('$global');

const playerJoinOrLoadTag = Tag('functions', vt`_player_join_or_load`);

onLoad(playerJoinOrLoad, () => {
	// Reset all counters (including the global counter) to ensure all players are detected as out of sync the next time they're online.
	scoreboard.players.reset('*', counter);
});

every('1t', playerJoinOrLoad, () => {
	execute
		.as('@a')
		// Check if the player's counter is not in sync with the global counter.
		// TODO: Replace `$globalCounter.target.toString(), $globalCounter.objective` with `$globalCounter`.
		.unless.score('@s', counter, '=', $globalCounter.target.toString(), $globalCounter.objective)
		// The player's counter is not in sync, so we can tell they joined the game.
		// TODO: Remove `.functionCmd`.
		.run.functionCmd(playerJoinOrLoadTag);

	// Increment the global counter, and sync all players' counters with it.
	execute
		.store.result.score('@a', counter)
		.run.scoreboard.players.add($globalCounter, 1);

	// The reason we use counters instead of the `minecraft.custom:minecraft.leave_game` criterion is because that criterion doesn't always detect players leaving due to server crashes.
});

/** Runs something as any player who joins the game and as `@a` on load. */
const onPlayerJoinOrLoad = (
	...args: [
		/** The `BaseLocation` to put the `player_join_or_load` function under. */
		baseLocation: BaseLocationInstance,
		callback: () => void
	] | [
		/** The function or function tag to add to the `playerJoinOrLoadTag`. */
		functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>
	]
) => {
	let functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>;

	if (args.length === 1) {
		[functionOrFunctionTag] = args;
	} else {
		const [baseLocation, callback] = args;

		functionOrFunctionTag = MCFunction(baseLocation`_player_join_or_load`, callback, {
			onConflict: 'append'
		});
	}

	// TODO: Use `!playerJoinOrLoadTag.has(functionOrFunctionTag)` instead.
	if (!playerJoinOrLoadTag.values.some(value => value.toString() === functionOrFunctionTag.toString())) {
		// TODO: Remove `as any`.
		playerJoinOrLoadTag.add(functionOrFunctionTag as any);
	}
};

export default onPlayerJoinOrLoad;