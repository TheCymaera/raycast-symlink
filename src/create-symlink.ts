import { showHUD, getSelectedFinderItems } from "@raycast/api";
import fs from "fs/promises";
import * as path from "path";

export default async function main() {
	const files = await getSelectedFinderItems().catch(() => undefined);

	if (!files) {
		await showHUD("Finder is not the front most application.");
		return;
	}

	if (!files.length) {
		await showHUD("No files selected.");
		return;
	}

	for (const file of files) {
		const directory = path.dirname(file.path);
		const extension = path.extname(file.path);
		const basename = path.basename(file.path, extension);

		const newName = await suggestAvailableName(directory, basename + " symlink", extension);
		const newPath = `${directory}/${newName}`;

		await fs.symlink(file.path, newPath);
		await showHUD(`Created symlink: ${newName}`);
	}
}


async function suggestAvailableName(directoryPath: string, idealName: string, extension: string) {
	let suffix = 0;

	while (suffix < 1000) {
		const newName = idealName + (suffix === 0 ? "" : ` ${suffix}`) + extension;
		
		const newPath = `${directoryPath}/${newName}`;

		const exists = await fs.stat(newPath).then(() => true).catch(() => false);
		if (!exists) return newName;

		suffix++;
	}
}