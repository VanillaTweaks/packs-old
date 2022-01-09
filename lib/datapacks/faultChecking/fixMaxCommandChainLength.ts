import vt from 'lib/datapacks/vt';
import { execute, MCFunction, schedule, Tag } from 'sandstone';
import temp from 'lib/datapacks/temp';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

const DEFAULT_MAX_COMMAND_CHAIN_LENGTH = 65536;

const maxCommandChainLength = vt('max_command_chain_length');

const $maxCommandChainLength = temp('$max_command_chain_length');

/** Schedules the `fixMaxCommandChainLengthTag` to run in 1 tick. */
export const scheduleFixMaxCommandChainLength = MCFunction(maxCommandChainLength`_schedule`, () => {
	schedule.function(fixMaxCommandChainLengthTag, '1t');
});

/** Checks the `maxCommandChainLength` game rule every tick to ensure it isn't set below the default. If it is, restores the default and warns the player about setting it lower. */
export const fixMaxCommandChainLengthTag = Tag('functions', maxCommandChainLength`_fix`, [
	// In case the `maxCommandChainLength` is 1 (the minimum value), run only one command per function in this tag.
	scheduleFixMaxCommandChainLength,
	MCFunction(maxCommandChainLength`_get`, () => {
		execute
			.store.result.score($maxCommandChainLength)
			.run.gamerule('maxCommandChainLength');
	}),
	MCFunction(maxCommandChainLength`_fix`, () => {
		execute
			// TODO: Remove `as any`.
			.if($maxCommandChainLength.matches(`..${DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1}` as any))
			.run.gamerule('maxCommandChainLength', DEFAULT_MAX_COMMAND_CHAIN_LENGTH);
	}),
	// The reason `fix` and `warn` are separate despite having the same `execute` condition is that the `function` command counts toward the `maxCommandChainLength`, so running it here is useless if the `maxCommandChainLength` is 1.
	// Also, changing the `maxCommandChainLength` has no effect for the rest of the function in which it was changed, so the two `execute` commands can't be placed in the same function.
	MCFunction(maxCommandChainLength`_warn`, () => {
		execute
			// TODO: Remove `as any`.
			.if($maxCommandChainLength.matches(`..${DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1}` as any))
			.run.tellraw('@a', [
				'',
				{ text: 'Do not set the ', color: 'red' },
				{ text: 'maxCommandChainLength', color: 'gold' },
				{ text: ` game rule below its default value of ${DEFAULT_MAX_COMMAND_CHAIN_LENGTH}. Setting it too low often breaks data packs. For that reason, it has automatically been reset to the default value.`, color: 'red' }
			]);
	})
]);

onUninstall(maxCommandChainLength, () => {
	schedule.clear(fixMaxCommandChainLengthTag);
});