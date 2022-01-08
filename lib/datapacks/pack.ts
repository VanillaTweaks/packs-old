import ResourceLocation from 'lib/datapacks/ResourceLocation';
import { title, namespace, version } from 'lib/meta';

/** The `ResourceLocation` for the data pack's namespace. */
const pack = ResourceLocation(namespace, { title, version });

export default pack;