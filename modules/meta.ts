import path from 'path';
import fs from 'fs-extra';

export const cwd = process.cwd().replace(/\\/g, '/');

const lastSlashIndex = cwd.lastIndexOf('/');

export const gameVersion: string = cwd.slice(cwd.lastIndexOf('/', lastSlashIndex - 1) + 1, lastSlashIndex);

export const namespace: string = cwd.slice(lastSlashIndex + 1);

export const { name, version, listed }: {
	name: string,
	version: string,
	listed: boolean
} = JSON.parse(fs.readFileSync(path.join(cwd, 'pack.json'), 'utf8'));