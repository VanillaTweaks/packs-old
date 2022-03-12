import hasEqualScore from 'lib/datapacks/hasEqualScore';
import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';
import lecternID from './lecternID';

const $lecternID = temp('$lecternID');

/** A predicate which checks whether `@s`'s `lecternID` score matches `temp('$lecternID')`. */
const matchesLecternID = hasEqualScore(pack`matches_lectern_id`, lecternID, $lecternID);

export default matchesLecternID;