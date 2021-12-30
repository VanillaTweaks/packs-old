import { execute, MCFunction, scoreboard, Tag } from 'sandstone';
import every from 'lib/datapacks/every';
import vt, { vt_ } from 'lib/datapacks/vt';
import objective from 'lib/datapacks/objective';
import onLoad from 'lib/datapacks/onLoad';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';

const playerJoinOrLoad = vt.child({ directory: 'player_join_or_load' });

const counter = objective(playerJoinOrLoad, 'counter');
const $globalCounter = counter('$global');

const playerJoinOrLoadTag = Tag('functions', vt_`player_join_or_load`);

onLoad(playerJoinOrLoad, () => {
	// Reset all counters (including the global counter) to ensure all players are detected as out of sync next time.
	// TODO: Remove `.toString()`.
	scoreboard.players.reset('*', counter.toString());
});

every('1t', playerJoinOrLoad, () => {
	execute
		.as('@a')
		// Check if the player's counter is not in sync with the global counter.
		.unless(counter('@s').equalTo($globalCounter))
		// The player's counter is not in sync, so we can tell they joined the game.
		.run.functionCmd(playerJoinOrLoadTag);

	// Increment the global counter, and sync all players' counters with it.
	execute
		.store.result.score(counter('@a'))
		// TODO: Replace `$globalCounter.target, $globalCounter.objective` with `$globalCounter`.
		.run.scoreboard.players.add($globalCounter.target, $globalCounter.objective, 1);

	// The reason we use counters instead of the `minecraft.custom:minecraft.leave_game` criterion is because that criterion doesn't always detect players leaving due to server crashes.
});

/** Runs a function as any player who joins the game, or as `@a` on load. */
const onPlayerJoinOrLoad = (
	/** The `BasePath` to put the function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	const basePath_ = internalBasePath(basePath);

	const playerJoinOrLoadFunction = MCFunction(basePath_`player_join_or_load`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!playerJoinOrLoadTag.has(playerJoinOrLoadFunction)` instead.
	if (!playerJoinOrLoadTag.values.some(value => value.toString() === playerJoinOrLoadFunction.toString())) {
		playerJoinOrLoadTag.add(playerJoinOrLoadFunction);
	}
};

export default onPlayerJoinOrLoad;