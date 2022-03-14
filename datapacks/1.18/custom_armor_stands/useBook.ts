import objective from 'lib/datapacks/objective';
import pack from 'lib/pack';

/** A `minecraft.used:minecraft.written_book` objective which is reset whenever the player uses a lectern. */
const useBook = objective(pack, 'use_book', 'minecraft.used:minecraft.written_book');

export default useBook;