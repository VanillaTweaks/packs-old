import type { JSONTextComponent } from 'sandstone';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import SPACE_WIDTH from 'lib/datapacks/textComponents/getWidth/SPACE_WIDTH';
import { containerWidth } from 'lib/datapacks/textComponents/withContainer';
import padding from 'lib/datapacks/textComponents/padding';
import padEachLine from 'lib/datapacks/textComponents/padEachLine';
import overlap from 'lib/datapacks/textComponents/overlap';
import getSingleLineWidth from 'lib/datapacks/textComponents/getWidth/getSingleLineWidth';

/**
 * Places a set of components into evenly spaced columns, each column being locally left-aligned, automatically minified.
 *
 * Disables array inheritance on the inputted components.
 */
const columns = (...components: JSONTextComponent[]) => {
	const componentWidths: number[] = [];

	/** The total width of in-game pixels remaining after subtracting the width of each column from the container width. */
	let freeSpace = containerWidth;

	for (const component of components) {
		const componentWidth = getWidth(component);
		componentWidths.push(componentWidth);

		freeSpace -= componentWidth;
	}

	/** Whether there should be padding to the left and right of all columns rather than only between columns. */
	let spacingAroundColumns = true;

	/** The amount of padding around or between each column, rounded to the nearest valid padding width. */
	let columnSpacing = freeSpace / (components.length + 1);

	if (
		// The below `columnSpacing` check is only useful if there's more than one column, because if there's only one column, it doesn't need any spacing.
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

	// Round to the nearest valid padding width.
	columnSpacing = getSingleLineWidth(padding(columnSpacing));

	const paddedColumns: JSONTextComponent[] = [];

	/** The amount of padding to insert before the next component pushed to `paddedColumns`. */
	let precedingPadding = 0;

	if (spacingAroundColumns) {
		precedingPadding += columnSpacing;
	}

	for (let columnIndex = 0; columnIndex < components.length; columnIndex++) {
		const component = components[columnIndex];

		paddedColumns.push(
			padEachLine(component, precedingPadding)
		);

		const componentWidth = componentWidths[columnIndex];
		precedingPadding += componentWidth;
		precedingPadding += columnSpacing;
	}

	return overlap(...paddedColumns);
};

export default columns;