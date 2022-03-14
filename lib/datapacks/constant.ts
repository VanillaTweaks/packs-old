import pack from 'lib/pack';
import vt from 'lib/vt';
import { scoreboard } from 'sandstone';
import objective from './objective';
import onLoad from './pseudoEvents/onLoad';

const vtConstants = vt.getChild('constants');

const constants = objective(vtConstants, vt.constants, 'dummy', undefined, { namespaced: false });

/** An array of constants which have already been set. */
const setConstants: number[] = [];

/** Returns a score for the specified constant. */
const constant = (value: number) => {
	if (!Number.isInteger(value)) {
		throw new RangeError(`${value} is not an integer, so it's not a valid scoreboard constant.`);
	}

	const $constant = constants(`$${value}`);

	if (!setConstants.includes(value)) {
		onLoad(pack, () => {
			scoreboard.players.set($constant, value);
		});

		setConstants.push(value);
	}

	return $constant;
};

export default constant;