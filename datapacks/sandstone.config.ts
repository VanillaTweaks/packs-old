import type { SandstoneConfig } from 'sandstone';
import path from 'path';
import fs from 'fs-extra';
import { gameVersion, namespace, title, version, listed } from 'lib/meta';
import packFormats from 'lib/datapacks/packFormats.json';
import { dataPack } from 'sandstone/init';
import { promisesAndFunctionsBeforeSave } from 'lib/beforeSave';

const config: SandstoneConfig = {
	namespace: 'vanillatweaks',
	name: namespace,
	packUid: namespace,
	formatVersion: (
		(packFormats as Partial<Record<string, number>>)[gameVersion]
		?? packFormats.default
	),
	description: [
		'',
		{ text: `${title} ${version} for MC ${gameVersion}.x`, color: 'gold' },
		{ text: '\nvanillatweaks.net', color: 'yellow' }
	],
	onConflict: {
		default: 'ignore'
	},
	saveOptions: {
		indentation: '',
		world: gameVersion.replace(/\./g, '_')
	},
	scripts: {
		beforeSave: async () => {
			for (const promiseOrFunction of promisesAndFunctionsBeforeSave) {
				await (
					typeof promiseOrFunction === 'function'
						? promiseOrFunction()
						: promiseOrFunction
				);
			}

			// Check if the data pack has any functions.
			if (dataPack.rootFunctions.size) {
				await import('lib/datapacks/checkFunctionPermissionLevel');
			}
		},
		afterAll: (async ({ destination }) => {
			if (destination && listed) {
				const vtName = namespace.replace(/_/g, ' ');

				const vtPath = path.join(__dirname, `../../resources/datapacks/${gameVersion}/${vtName}`);
				await fs.remove(vtPath);
				await fs.copy(destination, vtPath);

				const metaPath = path.join(__dirname, `../../resources/json/${gameVersion}/dpcategories.json`);
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