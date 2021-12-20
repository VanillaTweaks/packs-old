import type { JSONTextComponent } from 'sandstone';
import minify from 'lib/datapacks/textComponents/minify';

/** Concatenates an array of `JSONTextComponent`s into one `JSONTextComponent`, automatically minified. */
const join = (
	/** The array of text components to join. */
	components: JSONTextComponent[],
	/** A `JSONTextComponent` to be inserted between each element of the array. Defaults to `''`. */
	separator: JSONTextComponent = ''
) => {
	const joinedComponent: JSONTextComponent[] = [''];

	for (let i = 0; i < components.length; i++) {
		if (i !== 0) {
			joinedComponent.push(separator);
		}

		joinedComponent.push(components[i]);
	}

	return minify(joinedComponent);
};

export default join;