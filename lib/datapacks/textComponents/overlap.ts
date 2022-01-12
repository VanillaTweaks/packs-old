import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import minify from 'lib/datapacks/textComponents/minify';
import join from 'lib/datapacks/textComponents/join';
import padding from 'lib/datapacks/textComponents/padding';
import { containerWidth } from 'lib/datapacks/textComponents/withContainer';
import disableArrayInheritance from 'lib/datapacks/textComponents/disableArrayInheritance';

type JSONTextComponentRange = {
	/** The component in the range. Should not contain whitespace. */
	value: JSONTextComponent,
	/** The horizontal position at which the component starts in in-game pixels. */
	start: number,
	/** The horizontal position at which the component ends in in-game pixels. */
	end: number
};

/**
 * Overlaps multiple text components into the same text component, as if they were all rendered simultaneously in the same place, automatically minified.
 *
 * Disables array inheritance on the inputted component.
 *
 * Example:
 *
 * ```
 * overlap(
 * 	't   t',
 * 	'  t'
 * )
 * === 't t t'
 * ```
 */
const overlap = (...components: JSONTextComponent[]) => {
	/** An array of lines, each line represented by an array of `JSONTextComponentRange`s in order. */
	const rangeLines: JSONTextComponentRange[][] = [];

	for (const component of components) {
		const componentLines = split(disableArrayInheritance(component), '\n');

		for (let lineIndex = 0; lineIndex < componentLines.length; lineIndex++) {
			if (lineIndex >= rangeLines.length) {
				rangeLines[lineIndex] = [];
			}
			const rangeLine = rangeLines[lineIndex];

			const componentLine = componentLines[lineIndex];

			let value: JSONTextComponent[] = [];
			/** The horizontal position at which `value` starts within the `componentLine` in in-game pixels. */
			let start = 0;
			/** The width of `value` in in-game pixels. */
			let width = 0;

			const endValue = () => {
				if (value.length === 0) {
					return;
				}

				/** The index in the `rangeLine` at which the `value` should be inserted. */
				let valueIndex = 0;
				while (
					valueIndex < rangeLine.length
					&& start >= rangeLine[valueIndex].start
				) {
					valueIndex++;
				}

				const throwCollisionError = (conflictingSubcomponent: JSONTextComponent) => {
					throw new TypeError(
						'The text components cannot be overlapped due to collision between the following two subcomponents:\n'
						+ `${JSON.stringify(minify(conflictingSubcomponent))}\n`
						+ JSON.stringify(minify(value))
					);
				};

				if (valueIndex !== 0) {
					const previousRange = rangeLine[valueIndex - 1];

					if (start < previousRange.end) {
						throwCollisionError(previousRange.value);
					}
				}

				const end = start + width;

				if (valueIndex !== rangeLine.length) {
					const nextRange = rangeLine[valueIndex];

					if (end > nextRange.start) {
						throwCollisionError(nextRange.value);
					}
				}

				rangeLine.splice(valueIndex, 0, {
					value,
					start,
					end
				});
			};

			/** The `componentLine` split into an array in which odd indexes have whitespace-only segments and even indexes do not. */
			const subcomponents = split(
				componentLine,
				// The reason it's ` {2,}` instead of ` +` is because a single space in the middle of the string is most likely just a normal space that should not allow things to overlap it or be adjustable by missed padding when constructing the output.
				/(^ +| {2,}| +$)/
			);

			for (let i = 0; i < subcomponents.length; i++) {
				const subcomponent = subcomponents[i];
				const subcomponentWidth = getWidth(subcomponent);

				if (i % 2 === 0) {
					// This subcomponent does not contain only whitespace, so add it to the `value` if it isn't empty.

					if (subcomponentWidth !== 0) {
						value.push(subcomponent);
						width += subcomponentWidth;
					}
				} else {
					// This subcomponent contains only whitespace, so end the `value`.

					endValue();

					// Reset for the next `value`.
					start += width + subcomponentWidth;
					value = [];
					width = 0;
				}
			}

			endValue();
		}
	}

	const outputLines: JSONTextComponent[][] = [];

	for (let lineIndex = 0; lineIndex < rangeLines.length; lineIndex++) {
		const rangeLine = rangeLines[lineIndex];

		let outputLine: JSONTextComponent[];
		/** The amount of width in in-game pixels to add to the padding in order to avoid the line overflowing the container. */
		let paddingWidthOffset = 0;
		/** The maximum value that `paddingWidthOffset` is allowed to be before disallowing further overflow correction attempts. */
		const maxPaddingWidthOffset = 4;
		/** The amount that `outputLine`'s width exceeds the container width. */
		let overflowingWidth = 0;
		/** Each range's original `paddingWidth` value. */
		const paddingWidthsWithoutOffset: number[] = [];

		do {
			// Attempt to construct the `outputLine`.

			outputLine = [''];
			/** The position in the line at which the previous range ended in in-game pixels. */
			let previousEnd = 0;
			let paddingWidthOffsetRemaining = paddingWidthOffset;

			for (let rangeIndex = 0; rangeIndex < rangeLine.length; rangeIndex++) {
				const range = rangeLine[rangeIndex];

				const idealPaddingWidth = Math.max(0, range.start - previousEnd + paddingWidthOffsetRemaining);
				const paddingBeforeRange = padding(idealPaddingWidth);

				outputLine.push(
					paddingBeforeRange,
					range.value
				);

				const rangeWidth = range.end - range.start;
				const paddingWidth = getWidth(paddingBeforeRange);
				previousEnd += paddingWidth + rangeWidth;

				if (paddingWidthOffset === 0) {
					paddingWidthsWithoutOffset[rangeIndex] = paddingWidth;
				} else if (paddingWidthOffsetRemaining) {
					const paddingWidthWithoutOffset = paddingWidthsWithoutOffset[rangeIndex];
					paddingWidthOffsetRemaining = Math.min(
						0,
						paddingWidthOffsetRemaining + paddingWidthWithoutOffset - paddingWidth
					);
				}
			}

			overflowingWidth = previousEnd - containerWidth;
			if (overflowingWidth <= 0) {
				// The attempt was successful.
				break;
			}

			// The line overflows the container, so either try again with more overflow correction.
			paddingWidthOffset -= 0.5;
		} while (paddingWidthOffset <= maxPaddingWidthOffset);

		if (overflowingWidth > 0) {
			// The line still overflows the container.
			throw new TypeError(
				'The following text component cannot fit on one line:\n'
				+ JSON.stringify(minify(outputLine!))
			);
		}

		outputLines.push(outputLine!);
	}

	return minify(join(outputLines, '\n'));
};

export default overlap;