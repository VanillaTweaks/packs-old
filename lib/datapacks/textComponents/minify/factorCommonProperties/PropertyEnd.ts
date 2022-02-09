import PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import type PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';

export default class PropertyEnd extends PropertyBoundary {
	/** The `PropertyStart` which this marks the end of. */
	readonly start: PropertyStart;

	/** Marks the end of a series of consecutive subcomponents which are unaffected by a property. */
	constructor(start: PropertyEnd['start']) {
		super();

		this.start = start;
		this.start.end = this;
	}
}