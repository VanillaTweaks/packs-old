import codePointWidths from 'lib/datapacks/textComponents/getWidth/codePointWidths.json';
import legacyUnicodeCodePointWidths from 'lib/datapacks/textComponents/getWidth/legacyUnicodeCodePointWidths.json';

/** The width of an unknown code point in in-game pixels. */
const UNKNOWN_CODE_POINT_WIDTH = 6;
/** The width of an invalid surrogate character in in-game pixels. */
const INVALID_SURROGATE_WIDTH = 8;

/** The amount of additional width in in-game pixels that a non-legacy-unicode code point takes up when bold. */
const BOLD_CODE_POINT_EXTRA_WIDTH = 1;
/** The amount of additional width in in-game pixels that a legacy unicode code point takes up when bold. */
const BOLD_LEGACY_UNICODE_CODE_POINT_EXTRA_WIDTH = 0.5;

const MIN_HIGH_SURROGATE_CHAR_CODE = 0xd800;
const MAX_LOW_SURROGATE_CHAR_CODE = 0xdfff;

export type GetCodePointWidthOptions = {
	bold?: boolean
};

/**
 * Gets the width in in-game pixels that a code point takes up.
 *
 * ⚠️ Assumes the input is exactly one code point (and also not a line break).
 */
const getCodePointWidth = (
	codePoint: string,
	options: GetCodePointWidthOptions = {}
) => {
	let width = 0;

	if (codePoint in codePointWidths) {
		width += codePointWidths[codePoint as keyof typeof codePointWidths];
	} else if (codePoint in legacyUnicodeCodePointWidths) {
		width += legacyUnicodeCodePointWidths[codePoint as keyof typeof legacyUnicodeCodePointWidths];
	} else {
		const charCode = codePoint.charCodeAt(0);
		if (
			charCode >= MIN_HIGH_SURROGATE_CHAR_CODE
			&& charCode <= MAX_LOW_SURROGATE_CHAR_CODE
			&& codePoint.length === 1
		) {
			// This code point is a single surrogate character outside of a pair, which is invalid.
			width += INVALID_SURROGATE_WIDTH;
		} else {
			// This code point is unknown.
			width += UNKNOWN_CODE_POINT_WIDTH;
		}
	}

	if (options.bold) {
		width += (
			codePoint in legacyUnicodeCodePointWidths
				? BOLD_LEGACY_UNICODE_CODE_POINT_EXTRA_WIDTH
				: BOLD_CODE_POINT_EXTRA_WIDTH
		);
	}

	return width;
};

export default getCodePointWidth;