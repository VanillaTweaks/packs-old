import type { JSONTextComponent } from 'sandstone';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import split from 'lib/datapacks/textComponents/split';
import { containerWidth } from 'lib/datapacks/textComponents/container';
import padding from 'lib/datapacks/textComponents/padding';
import join from 'lib/datapacks/textComponents/join';

/** The width of a plain space in in-game pixels. */
const SPACE_WIDTH = getWidth(' ');

/**
 * Places a set of components into evenly spaced columns, each column being locally left-aligned.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const columns = (...components: JSONTextComponent[]) => {
	/** An array in which each element is an array of a column's lines. */
	const componentsLines: JSONTextComponent[][] = [];

	/** An array in which each element is an array of a column's line widths. */
	const componentsLineWidths: number[][] = [];

	/** An array of each column's width. */
	const componentWidths: number[] = [];

	/** The number of lines in the output. */
	let outputLineCount = 0;

	/** The total width of in-game pixels remaining after subtracting the width of each column from the container width. */
	let freeSpace = containerWidth;

	for (const component of components) {
		const componentLines = split(component, '\n');
		componentsLines.push(componentLines);

		const componentLineWidths = componentLines.map(line => getWidth(line));
		componentsLineWidths.push(componentLineWidths);

		const componentWidth = Math.max(...componentLineWidths);
		componentWidths.push(componentWidth);

		if (componentLines.length > outputLineCount) {
			outputLineCount = componentLines.length;
		}

		freeSpace -= componentWidth;
	}

	/** Whether there should be padding to the left and right of all columns rather than only between columns. */
	let spacingAroundColumns = true;

	/** The amount of padding around or between each column, rounded to the nearest valid padding width. */
	let columnSpacing = freeSpace / (components.length + 1);

	if (
		// This check is only useful if there are more than one columns, because if there's only one column, it doesn't need any spacing.
		components.length > 1
		&& columnSpacing < SPACE_WIDTH
	) {
		// There isn't room to fit the spacing around columns, so try removing it.
		spacingAroundColumns = false;

		columnSpacing = freeSpace / (components.length - 1);

		if (columnSpacing < SPACE_WIDTH) {
			// There isn't room to fit any spacing between columns either.
			throw new TypeError('The specified columns are too wide to fit in the container.');
		}
	}

	// Rounded to the nearest valid padding width.
	columnSpacing = getWidth(padding(columnSpacing));

	const outputLines: JSONTextComponent[] = [];

	for (let lineIndex = 0; lineIndex < outputLineCount; lineIndex++) {
		const outputLine: JSONTextComponent[] = [];

		/** The amount of padding to be added immediately before the next component pushed to `outputLine`. */
		let precedingPadding = 0;

		if (spacingAroundColumns) {
			precedingPadding += columnSpacing;
		}

		for (let columnIndex = 0; columnIndex < componentsLines.length; columnIndex++) {
			const componentLine = componentsLines[columnIndex][lineIndex] as JSONTextComponent | undefined;

			if (componentLine !== undefined) {
				outputLine.push(
					padding(precedingPadding),
					componentLine
				);

				precedingPadding = 0;
			}

			const componentWidth = componentWidths[columnIndex];
			const componentLineWidth = componentsLineWidths[columnIndex][lineIndex];
			precedingPadding += componentWidth - componentLineWidth;

			precedingPadding += columnSpacing;
		}

		outputLines.push(outputLine);
	}

	return join(outputLines, '\n');
};

export default columns;