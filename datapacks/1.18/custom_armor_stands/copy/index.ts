import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';

/** A `temp` score with a `BookLocation` as its value, set by `copyBookToStorage`. */
export const $bookLocation = temp('$bookLocation');

export enum BookLocation {
	NOT_FOUND = -1,
	MAINHAND,
	OFFHAND,
	LECTERN
}

/** A selector to the marker with the `pack.current_lectern` tag. */
export const currentLectern = `@e[type=minecraft:marker,tag=${pack.current_lectern},limit=1]`;