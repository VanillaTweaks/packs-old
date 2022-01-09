import ResourceLocation from 'lib/datapacks/ResourceLocation';
import { title, namespace, version } from 'lib/meta';

/** The `ResourceLocation` for the data pack's namespace. */
const pack = ResourceLocation(namespace, { title, version });

if (pack.PATH !== undefined) {
	throw new TypeError('The pack\'s namespace is invalid.');
}

export default pack;