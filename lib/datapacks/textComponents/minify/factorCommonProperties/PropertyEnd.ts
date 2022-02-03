import PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import type PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';

/** Marks the end of a series of consecutive subcomponents which are unaffected by a property. */
export default class PropertyEnd extends PropertyBoundary {
	/** The `PropertyStart` which this marks the end of. */
	readonly start: PropertyStart;

	/** The approximate total number of the characters required by this property throughout all subcomponents. */
	readonly cost: number;

	constructor(start: PropertyEnd['start']) {
		super();

		this.start = start;
		this.start.end = this;

		this.cost = this.start.quantity * this.start.length;
	}
}