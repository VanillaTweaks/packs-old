import every from 'lib/datapacks/every';
import objective from 'lib/datapacks/objective';
import pack from 'lib/pack';
import { scoreboard } from 'sandstone';
import lecternID from './lectern/lecternID';

/** A `minecraft.used:minecraft.written_book` objective which is reset whenever the player uses a lectern. */
const useBook = objective(pack, 'open_book', 'minecraft.used:minecraft.written_book');

export default useBook;

every('1t', pack, () => {
	// When a player uses a book in their hand, we know they are no longer using a lectern.
	scoreboard.players.reset(`@a[scores={${useBook}=1..}]`, lecternID);
});