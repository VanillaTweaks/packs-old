import type { MCFunctionInstance, TagInstance } from 'sandstone';
import { execute, MCFunction, scoreboard, Tag } from 'sandstone';
import every from 'lib/datapacks/every';
import vt, { vt_ } from 'lib/datapacks/vt';
import objective from 'lib/datapacks/objective';
import onLoad from 'lib/datapacks/onLoad';

const playerLoadOrJoin = vt.child({ directory: 'player_load_or_join' });

const counter = objective(playerLoadOrJoin, 'counter');
const $globalCounter = counter('$global');

const playerLoadOrJoinTag = Tag('functions', vt_`player_load_or_join`);

onLoad(playerLoadOrJoin, () => {
	// TODO: Replace all `$globalCounter.target, $globalCounter.objective` with `$globalCounter`.
	scoreboard.players.reset($globalCounter.target, $globalCounter.objective);
});

every('1t', playerLoadOrJoin, () => {
	execute
		.as('@a')
		// Check if the player's counter is not in sync with the global counter.
		.unless(counter('@s').equalTo($globalCounter))
		// The player's counter is not in sync, so we can tell they joined the game.
		.run.functionCmd(playerLoadOrJoinTag);

	// Increment the global counter, and sync all players' counters with it.
	execute
		.store.result.score(counter('@a'))
		.run.scoreboard.players.add($globalCounter.target, $globalCounter.objective, 1);

	// The reason we use counters instead of the `minecraft.custom:minecraft.leave_game` criterion is because that criterion doesn't always detect server crashes.
});

/** Runs a function as any player who joins the game, or as all players on load. */
const onPlayerLoadOrJoin = (
	...args: (
		[functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>]
		| [
			/** The namespaced name of the function to run as a player who joins the game. */
			functionName: string,
			callback: () => void
		]
	)
) => {
	const functionOrFunctionTag = (
		args.length === 1
			? args[0]
			: MCFunction(...args)
	);

	// TODO: Check for `!playerLoadOrJoinTag.has(functionOrFunctionTag)` first.
	// TODO: Remove `as any`.
	playerLoadOrJoinTag.add(functionOrFunctionTag as any);
};

export default onPlayerLoadOrJoin;