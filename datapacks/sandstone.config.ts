import type { SandstoneConfig } from 'sandstone';
import path from 'path';
import fs from 'fs-extra';
import { gameVersion, namespace, title, version, listed } from 'lib/meta';
import { packState } from 'lib/datapacks/pack/state';
import packFormats from 'lib/datapacks/packFormats.json';

const config: SandstoneConfig = {
	namespace: 'vanillatweaks',
	name: namespace,
	packUid: namespace,
	formatVersion: (
		packFormats.default
		|| (packFormats as Record<string, number>)[gameVersion]
	),
	description: [
		'',
		{ text: `${title} ${version} for MC ${gameVersion}.x`, color: 'gold' },
		{ text: '\nvanillatweaks.net', color: 'yellow' }
	],
	saveOptions: {
		indentation: '',
		world: gameVersion.replace(/\./g, '_')
	},
	scripts: {
		beforeSave: () => {
			for (const finishFunction of packState.finishFunctions) {
				finishFunction();
			}
		},
		afterAll: (async ({ destination }) => {
			if (destination && listed) {
				const vtName = namespace.replace(/_/g, ' ');

				const vtPath = path.join(__dirname, `../../VanillaTweaks/resources/datapacks/${gameVersion}/${vtName}`);
				await fs.remove(vtPath);
				await fs.copy(destination, vtPath);

				const metaPath = path.join(__dirname, `../../VanillaTweaks/resources/json/${gameVersion}/dpcategories.json`);
				await fs.writeFile(
					metaPath,
					(await fs.readFile(metaPath, 'utf8'))
						.replace(
							new RegExp(`((\\n\\t+)"name": "${vtName}",(?:\\2.+,)*\\2"version": )"[^"]+"`),
							`$1"${version}"`
						)
				);
			}
		})
	}
};

export default config;