const fs = require("node:fs/promises");
const path = require("node:path");

const DATA_DIR = "data";
const INFO_FILE = "info.json";
const ASSETS_PATH = path.join("public", "activities");
const ACTIVITIES_DIR = "activities";

async function deleteAndRecreateDirectory(directory) {
    await fs.rm(directory, { recursive: true, force: true });
    await fs.mkdir(directory);
}

async function copyAssets(authorSlug, activitySlug, infoFileContent) {
    // List of properties that contain paths of assets to be copied
    const assetsPaths = [
        infoFileContent.previewImage.filename,
        ...infoFileContent?.assets || [] 
    ];
    await fs.mkdir(path.join(ASSETS_PATH, authorSlug, activitySlug));
    return Promise.all(assetsPaths.map(asset => {
        const sourcePath = path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, asset);
        const destinationPath = path.join(ASSETS_PATH, authorSlug, activitySlug, asset);
        return fs.copyFile(sourcePath, destinationPath);
    }));
}

async function main() {
    // Clean up the generated directories and create new ones
    await deleteAndRecreateDirectory(ASSETS_PATH);

    // List all authors
    const authorSlugs = (await fs.readdir(DATA_DIR, { withFileTypes: true }))
        .filter(item => item.isDirectory())
        .map(item => item.name);

    authorSlugs.forEach(async authorSlug => {
        // Create author folder
        await fs.mkdir(path.join(ASSETS_PATH, authorSlug));

        // List all activities
        const activitySlugs = (await fs.readdir(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR), { withFileTypes: true }))
            .filter(item => item.isDirectory())
            .map(item => item.name);

        // For each activity, copy the referenced assets into the public folder
        activitySlugs.forEach(async activitySlug => {
            const infoFileContent = JSON.parse(await fs.readFile(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, INFO_FILE)));

            await copyAssets(authorSlug, activitySlug, infoFileContent);

        });
    });
}

main();
