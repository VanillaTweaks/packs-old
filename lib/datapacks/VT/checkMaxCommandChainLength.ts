import { VT_ } from 'lib/datapacks/VT';
import { execute, MCFunction, schedule, Tag } from 'sandstone';

const DEFAULT_MAX_COMMAND_CHAIN_LENGTH = 65536;

const maxCommandChainLength = VT_.child({ directory: 'max_command_chain_length' });

// TODO: Replace all instances of `'vt.temp'` in the project with ``VT`.temp```.

/** Checks the `maxCommandChainLength` game rule every tick to ensure it isn't set below the default. If it is, restores the default and warns the player about setting it lower. */
const checkMaxCommandChainLength = Tag('functions', maxCommandChainLength`check`, [
	// Run only one command per function in case the `maxCommandChainLength` is 1.
	// TODO: Ensure the `` VT`temp` `` objective is added before this.
	MCFunction(maxCommandChainLength`schedule`, () => {
		schedule.function(checkMaxCommandChainLength, '1t');
	}),
	MCFunction(maxCommandChainLength`get`, () => {
		execute
			.store.result.score('#maxCommandChainLength', 'vt.temp')
			.run.gamerule('maxCommandChainLength');
	}),
	MCFunction(maxCommandChainLength`fix`, () => {
		execute
			.if.score('#maxCommandChainLength', 'vt.temp', 'matches', [, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1])
			.run.gamerule('maxCommandChainLength', DEFAULT_MAX_COMMAND_CHAIN_LENGTH);
	}),
	// The reason `fix` and `warn` are separate despite having the same `execute` condition is that the `function` command counts toward the `maxCommandChainLength`, so running it here is useless if the `maxCommandChainLength` is 1.
	// The reason both `execute` commands can't be merged into one function is that changing the `maxCommandChainLength` has no effect for the rest of the function in which it was changed.
	MCFunction(maxCommandChainLength`warn`, () => {
		execute
			.if.score('#maxCommandChainLength', 'vt.temp', 'matches', [, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1])
			.run.tellraw('@a', [
				{ text: `Do not set the "maxCommandChainLength" game rule below its default value of ${DEFAULT_MAX_COMMAND_CHAIN_LENGTH}. Setting it too low often breaks data packs. It has automatically been reset to the default value accordingly.`, color: 'red' }
			]);
	})
]);

export default checkMaxCommandChainLength;