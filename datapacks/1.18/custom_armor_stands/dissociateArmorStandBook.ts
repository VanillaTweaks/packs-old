import { scoreboard } from 'sandstone';
import { lecternID } from './lectern';
import openBook from './openBook';

/** Dissociates `@s` from the book they last opened by resetting their `lecternID` and `openBook` scores. */
const dissociateArmorStandBook = () => {
	scoreboard.players.reset('@s', lecternID);
	scoreboard.players.reset('@s', openBook);
};

export default dissociateArmorStandBook;