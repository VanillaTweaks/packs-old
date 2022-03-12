import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';

/** A score with 0 if the armor stand book is in neither hand, 1 if it's in the mainhand, or 2 if it's in the offhand. */
export const $bookInHand = temp('$bookInHand');

/** A selector to the marker with the `pack.current_lectern` tag. */
export const currentLectern = `@e[type=minecraft:marker,tag=${pack.current_lectern},limit=1]`;