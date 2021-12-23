import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import minify from 'lib/datapacks/textComponents/minify';
import join from 'lib/datapacks/textComponents/join';
import padding from 'lib/datapacks/textComponents/padding';
import { containerWidth } from 'lib/datapacks/textComponents/container';

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
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
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
		const componentLines = split(component, '\n');

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

			const iterateSubcomponent = (
				subcomponent: JSONTextComponent,
				properties: Partial<TextComponentObject> = {}
			) => {
				if (typeof subcomponent === 'string') {
					const substrings = subcomponent.split(
						// The reason it's ` {2,}` instead of ` +` is because a single space in the middle of the string is most likely just a normal space that should not allow things to overlap it or be adjustable by missed padding when constructing the output.
						/(^ +| {2,}| +$)/
					);

					for (let i = 0; i < substrings.length; i++) {
						const substring = substrings[i];

						if (i % 2 === 0) {
							// This substring does not contain only whitespace, so add it to the `value`.

							if (substring) {
								value.push({
									...properties,
									text: substring
								});
								width += getWidth(substring, properties);
							}
						} else {
							// This substring contains only whitespace, so end the `value`.

							endValue();

							// Reset for the next `value`.
							start += width + getWidth(substring, properties);
							value = [];
							width = 0;
						}
					}

					return;
				}

				if (Array.isArray(subcomponent)) {
					if (subcomponent.length === 0) {
						return;
					}

					if (typeof subcomponent[0] === 'object') {
						properties = {
							...properties,
							...subcomponent[0]
						};
					}

					for (let i = 0; i < subcomponent.length; i++) {
						iterateSubcomponent(subcomponent[i], properties);
					}

					return;
				}

				if (typeof subcomponent === 'number' || typeof subcomponent === 'boolean') {
					iterateSubcomponent(subcomponent.toString(), properties);

					return;
				}

				if ('extra' in subcomponent && subcomponent.extra) {
					throw new TypeError('The `extra` property is not supported when overlapping text components.');
				}

				properties = {
					...properties,
					...subcomponent
				};

				if ('text' in subcomponent) {
					iterateSubcomponent(subcomponent.text, properties);

					return;
				}

				throw new TypeError(
					'The following text component cannot be overlapped due to having indeterminate width:\n'
					+ JSON.stringify(component)
				);
			};

			iterateSubcomponent(componentLine);

			endValue();
		}
	}

	const outputLines: JSONTextComponent[][] = [];

	for (let lineIndex = 0; lineIndex < rangeLines.length; lineIndex++) {
		const rangeLine = rangeLines[lineIndex];

		let outputLine: JSONTextComponent[];
		/** The `end` value of the previous range. */
		let previousEnd;
		/** The net difference between actual padding and ideal padding that should be corrected for. Can be negative. */
		let missedPaddingWidth = 0;
		/** The amount that `outputLine`'s width exceeds the container width. */
		let overflowingWidth: number;

		for (let attempts = 0; attempts < 2; attempts++) {
			// Attempt to construct the `outputLine`.

			const initialMissedPaddingWidth = missedPaddingWidth;
			outputLine = [''];
			previousEnd = 0;

			for (const range of rangeLine) {
				const idealPaddingWidthBeforeRange = range.start - previousEnd + missedPaddingWidth;
				const paddingBeforeRange = padding(
					Math.max(0, idealPaddingWidthBeforeRange)
				);

				outputLine.push(
					paddingBeforeRange,
					range.value
				);

				missedPaddingWidth = idealPaddingWidthBeforeRange - getWidth(paddingBeforeRange);
				previousEnd = range.end;
			}

			missedPaddingWidth -= initialMissedPaddingWidth;

			overflowingWidth = previousEnd - missedPaddingWidth - containerWidth;
			if (overflowingWidth <= 0) {
				// The attempt was successful.
				break;
			}

			// The line overflows the container, so either try again from the beginning with the `missedPaddingWidth` at its new negative value, or throw an error after running out of attempts.
		}

		if (overflowingWidth! > 0) {
			// The line still overflows the container.
			throw new TypeError(
				'There is not enough padding between overlapping subcomponents to fit the following text component on one line:\n'
				+ JSON.stringify(minify(outputLine!))
			);
		}

		outputLines.push(outputLine!);
	}

	return join(outputLines, '\n');
};

export default overlap;