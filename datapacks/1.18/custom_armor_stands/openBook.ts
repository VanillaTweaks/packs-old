import every from 'lib/datapacks/every';
import objective from 'lib/datapacks/objective';
import pack from 'lib/pack';
import { scoreboard } from 'sandstone';
import { lecternID } from './lectern/markLecterns';

/** A `minecraft.used:minecraft.written_book` objective which is reset whenever the player opens a lectern. */
const openBook = objective(pack, 'open_book', 'minecraft.used:minecraft.written_book');

export default openBook;

every('1t', pack, () => {
	// When a player opens a book in their hand, we know they are no longer opening a lectern.
	scoreboard.players.reset(`@a[scores={${openBook}=1..}]`, lecternID);
});