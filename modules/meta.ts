import path from 'path';
import fs from 'fs-extra';

export const packDirectory = path.join(
	process.cwd(),
	process.argv[process.argv.length - 1]
);

const lastSlashIndex = packDirectory.lastIndexOf(path.sep);

export const gameVersion: string = packDirectory.slice(packDirectory.lastIndexOf(path.sep, lastSlashIndex - 1) + 1, lastSlashIndex);

export const namespace: string = packDirectory.slice(lastSlashIndex + 1);

export const { name, version, listed }: {
	name: string,
	version: string,
	listed: boolean
} = JSON.parse(fs.readFileSync(path.join(packDirectory, 'pack.json'), 'utf8'));

console.log(version);