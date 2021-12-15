import vt from 'lib/datapacks/vt';
import { execute, MCFunction, schedule, Tag } from 'sandstone';
import getInternalChild from 'lib/datapacks/getInternalChild';
import temp from 'lib/datapacks/vt/temp';

const DEFAULT_MAX_COMMAND_CHAIN_LENGTH = 65536;

const maxCommandChainLength_ = getInternalChild(
	vt.child({ directory: 'max_command_chain_length' })
);

const $maxCommandChainLength = temp('#maxCommandChainLength');

/** Checks the `maxCommandChainLength` game rule every tick to ensure it isn't set below the default. If it is, restores the default and warns the player about setting it lower. */
const checkMaxCommandChainLength = Tag('functions', maxCommandChainLength_`check`, [
	// Run only one command per function in case the `maxCommandChainLength` is 1.
	MCFunction(maxCommandChainLength_`schedule`, () => {
		schedule.function(checkMaxCommandChainLength, '1t');
	}),
	MCFunction(maxCommandChainLength_`get`, () => {
		execute
			.store.result.score($maxCommandChainLength)
			.run.gamerule('maxCommandChainLength');
	}),
	MCFunction(maxCommandChainLength_`fix`, () => {
		execute
			// Replace all `[, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1]` with `` `..${DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1}` ``.
			.if($maxCommandChainLength.matches([, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1]))
			.run.gamerule('maxCommandChainLength', DEFAULT_MAX_COMMAND_CHAIN_LENGTH);
	}),
	// The reason `fix` and `warn` are separate despite having the same `execute` condition is that the `function` command counts toward the `maxCommandChainLength`, so running it here is useless if the `maxCommandChainLength` is 1.
	// The reason both `execute` commands can't be merged into one function is that changing the `maxCommandChainLength` has no effect for the rest of the function in which it was changed.
	MCFunction(maxCommandChainLength_`warn`, () => {
		execute
			.if($maxCommandChainLength.matches([, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1]))
			.run.tellraw('@a', [
				{ text: `Do not set the "maxCommandChainLength" game rule below its default value of ${DEFAULT_MAX_COMMAND_CHAIN_LENGTH}. Setting it too low often breaks data packs. It has automatically been reset to the default value accordingly.`, color: 'red' }
			]);
	})
]);

export default checkMaxCommandChainLength;