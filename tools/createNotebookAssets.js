const fs = require("node:fs/promises");
const path = require("node:path");

const SOURCE_NOTEBOOKS_DIR = "learning_modules";
const INFO_FILE = "info.json";
const ASSETS_PATH = path.join("public", "modules");

async function deleteAndRecreateDirectory(directory) {
    await fs.rm(directory, { recursive: true, force: true });
    await fs.mkdir(directory);
}

async function copyAssets(slug, infoFileContent) {
    // List of properties that contain paths of assets to be copied
    const assetsPaths = [
        infoFileContent.previewImage,
    ];
    await fs.mkdir(path.join(ASSETS_PATH, slug))
    return Promise.all(assetsPaths.map(asset => {
        const sourcePath = path.join(SOURCE_NOTEBOOKS_DIR, slug, asset);
        const destinationPath = path.join(ASSETS_PATH, slug, asset);
        return fs.copyFile(sourcePath, destinationPath);
    }));
}

async function main() {
    // Clean up the generated directories and create new ones
    await deleteAndRecreateDirectory(ASSETS_PATH);

    // List all learning modules
    const slugs = (await fs.readdir(SOURCE_NOTEBOOKS_DIR, { withFileTypes: true }))
        .filter(item => item.isDirectory())
        .map(item => item.name);

    // For each learning module, copy the referenced assets into the public folder
    slugs.forEach(async slug => {
        const infoFileContent = JSON.parse(await fs.readFile(path.join(SOURCE_NOTEBOOKS_DIR, slug, INFO_FILE)));

        await copyAssets(slug, infoFileContent);

    });
}

main();