import BaseLocation from 'lib/datapacks/BaseLocation';
import { title, namespace, version } from 'lib/meta';

/** The `BaseLocation` for the data pack's namespace. */
const pack = BaseLocation(namespace, { title, version });

if (pack.PATH !== undefined) {
	throw new TypeError('The pack\'s namespace is invalid.');
}

export default pack;