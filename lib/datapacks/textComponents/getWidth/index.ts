import type { JSONTextComponent } from 'sandstone';
import nonLegacyUnicodeCodePoints from 'lib/datapacks/textComponents/getWidth/nonLegacyUnicodeCodePoints.json';
import codePointWidths from 'lib/datapacks/textComponents/getWidth/codePointWidths.json';
import split from 'lib/datapacks/textComponents/split';
import { ComponentClass } from 'sandstone/variables';

/** The width of an unknown code point in in-game pixels. */
const UNKNOWN_CODE_POINT_WIDTH = 6;
/** The width of an invalid surrogate character in in-game pixels. */
const INVALID_SURROGATE_WIDTH = 8;

/** The amount of additional width in in-game pixels that a non-legacy-unicode code point takes up when bold. */
const BOLD_CODE_POINT_EXTRA_WIDTH = 1;
/** The amount of additional width in in-game pixels that a legacy unicode code point takes up when bold. */
const BOLD_LEGACY_UNICODE_CODE_POINT_EXTRA_WIDTH = 0.5;

const MIN_HIGH_SURROGATE_CHAR_CODE = 0xd800;
const MAX_HIGH_SURROGATE_CHAR_CODE = 0xdbff;
const MIN_LOW_SURROGATE_CHAR_CODE = 0xdc00;
const MAX_LOW_SURROGATE_CHAR_CODE = 0xdfff;

/** Gets the width in in-game pixels that a `JSONTextComponent` takes up. */
const getWidth = (
	component: JSONTextComponent,
	{ bold = false } = {}
): number => {
	const lines = split(component, '\n');
	if (lines.length > 1) {
		return Math.max(
			...lines.map(line => getWidth(line))
		);
	}

	if (typeof component === 'object') {
		if (Array.isArray(component)) {
			if (component.length === 0) {
				return 0;
			}

			if (
				typeof component[0] === 'object'
				&& 'bold' in component[0]
				&& component[0].bold !== undefined
			) {
				bold = component[0].bold;
			}

			let width = 0;

			for (let i = 0; i < component.length; i++) {
				width += getWidth(component[i], { bold });
			}

			return width;
		}

		if (component instanceof ComponentClass) {
			throw new Error('TODO: Handle `ComponentClass`.');
		}

		if ('bold' in component && component.bold !== undefined) {
			bold = component.bold;
		}

		if ('text' in component) {
			let width = getWidth(component.text, { bold });

			if ('extra' in component && component.extra) {
				width += getWidth(component.extra, { bold });
			}

			return width;
		}

		throw new TypeError(
			'The width of the following text component cannot be determined:\n'
			+ JSON.stringify(component)
		);
	}

	// If this point is reached, `component` is primitive.

	component = component.toString();

	let width = 0;

	for (let i = 0; i < component.length; i++) {
		let codePoint: string = component[i];
		const charCode = component.charCodeAt(i);

		let invalidSurrogate = false;

		if (
			charCode >= MIN_HIGH_SURROGATE_CHAR_CODE
			&& charCode <= MAX_LOW_SURROGATE_CHAR_CODE
		) {
			// This character is a surrogate.

			invalidSurrogate = true;

			if (charCode <= MAX_HIGH_SURROGATE_CHAR_CODE) {
				// This character is a high surrogate.

				const nextCharCode = component.charCodeAt(i + 1);
				if (
					nextCharCode >= MIN_LOW_SURROGATE_CHAR_CODE
					&& nextCharCode <= MAX_LOW_SURROGATE_CHAR_CODE
				) {
					// This character is a high surrogate followed by a low surrogate.

					invalidSurrogate = false;

					codePoint += component[i + 1];

					// Move past the low surrogate to the next code point.
					i++;
				}
			}
		}

		const knownCodePoint = codePoint in codePointWidths;

		width += (
			invalidSurrogate
				? INVALID_SURROGATE_WIDTH
				: knownCodePoint
					? codePointWidths[codePoint as keyof typeof codePointWidths]
					: UNKNOWN_CODE_POINT_WIDTH
		);

		if (bold) {
			const nonLegacyUnicode = (
				invalidSurrogate
				|| !knownCodePoint
				|| nonLegacyUnicodeCodePoints[codePoint.length as 1 | 2].includes(codePoint)
			);

			width += (
				nonLegacyUnicode
					? BOLD_CODE_POINT_EXTRA_WIDTH
					: BOLD_LEGACY_UNICODE_CODE_POINT_EXTRA_WIDTH
			);
		}
	}

	return width;
};

export default getWidth;

/** The width of a plain space in in-game pixels. */
export const SPACE_WIDTH = getWidth(' ');