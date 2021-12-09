import VT, { VT_ } from 'lib/datapacks/VT';
import { execute, gamerule, MCFunction, schedule, Tag, tellraw } from 'sandstone';

const DEFAULT_MAX_COMMAND_CHAIN_LENGTH = 65536;

const maxCommandChainLength = VT_.child({ directory: 'max_command_chain_length' });

/** Periodically checks the `maxCommandChainLength` game rule to ensure it isn't set below the default. If it is, restores the default and warns the player about setting it lower. */
const checkMaxCommandChainLength = () => {
	const checkMaxCommandChainLengthTag = Tag('functions', maxCommandChainLength`check`, [
		// Run only one command per function in case the `maxCommandChainLength` is 1.
		MCFunction(maxCommandChainLength`schedule`, () => {
			schedule.function(checkMaxCommandChainLengthTag, '5s');
		}),
		MCFunction(maxCommandChainLength`get`, () => {
			execute
				.store.result.score('#maxCommandChainLength', VT`.temp`)
				.run.gamerule('maxCommandChainLength');
		}),
		MCFunction(maxCommandChainLength`check`, () => {
			execute
				.if.score('#maxCommandChainLength', VT`.temp`, 'matches', [, DEFAULT_MAX_COMMAND_CHAIN_LENGTH])
				.run(Tag('functions', maxCommandChainLength`fix`, [
					MCFunction(maxCommandChainLength`fix`, () => {
						gamerule('maxCommandChainLength', DEFAULT_MAX_COMMAND_CHAIN_LENGTH);
					}),
					MCFunction(maxCommandChainLength`warn`, () => {
						tellraw('@a', [
							{ text: `Do not set the "maxCommandChainLength" game rule below its default value of ${DEFAULT_MAX_COMMAND_CHAIN_LENGTH}. Setting it too low often breaks data packs. It has automatically been reset to the default value accordingly.`, color: 'red' }
						]);
					})
				]));
		})
	], {
		runOnLoad: true
	});
};

export default checkMaxCommandChainLength;