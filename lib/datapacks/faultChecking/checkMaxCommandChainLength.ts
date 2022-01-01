import vt from 'lib/datapacks/vt';
import { execute, MCFunction, schedule, Tag } from 'sandstone';
import internalBasePath from 'lib/datapacks/internalBasePath';
import temp from 'lib/datapacks/temp';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

const DEFAULT_MAX_COMMAND_CHAIN_LENGTH = 65536;

const maxCommandChainLength = vt.child({ directory: 'max_command_chain_length' });
const maxCommandChainLength_ = internalBasePath(maxCommandChainLength);

const $maxCommandChainLength = temp('$maxCommandChainLength');

/** Checks the `maxCommandChainLength` game rule every tick to ensure it isn't set below the default. If it is, restores the default and warns the player about setting it lower. */
export const checkMaxCommandChainLengthTag = Tag('functions', maxCommandChainLength_`check`, [
	// In case the `maxCommandChainLength` is 1 (the minimum value), run only one command per function in this tag.
	MCFunction(maxCommandChainLength_`schedule`, () => {
		schedule.function(checkMaxCommandChainLengthTag, '1t');
	}),
	MCFunction(maxCommandChainLength_`get`, () => {
		execute
			.store.result.score($maxCommandChainLength)
			.run.gamerule('maxCommandChainLength');
	}),
	MCFunction(maxCommandChainLength_`fix`, () => {
		execute
			// TODO: Replace all `[, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1]` with `` `..${DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1}` ``.
			.if($maxCommandChainLength.matches([, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1]))
			.run.gamerule('maxCommandChainLength', DEFAULT_MAX_COMMAND_CHAIN_LENGTH);
	}),
	// The reason `fix` and `warn` are separate despite having the same `execute` condition is that the `function` command counts toward the `maxCommandChainLength`, so running it here is useless if the `maxCommandChainLength` is 1.
	// Also, changing the `maxCommandChainLength` has no effect for the rest of the function in which it was changed, so the two `execute` commands can't be placed in the same function.
	MCFunction(maxCommandChainLength_`warn`, () => {
		execute
			.if($maxCommandChainLength.matches([, DEFAULT_MAX_COMMAND_CHAIN_LENGTH - 1]))
			.run.tellraw('@a', [
				{ text: `Do not set the "maxCommandChainLength" game rule below its default value of ${DEFAULT_MAX_COMMAND_CHAIN_LENGTH}. Setting it too low often breaks data packs. It has automatically been reset to the default value accordingly.`, color: 'red' }
			]);
	})
]);

onUninstall(maxCommandChainLength, () => {
	schedule.clear(checkMaxCommandChainLengthTag);
});