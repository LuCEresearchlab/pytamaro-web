import path from "path";
import fs from "fs";
import { ACTIVITIES_DIR, DATA_DIR } from "./utils.mjs";
import { Activity } from "../src/schemas/activitySchema";

const INFO_FILE = "info.json";

const ASSETS_PATH = path.join("public", "activities");

function deleteAndRecreateDirectory(directory: string) {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory);
}

function copyAssets(authorSlug: string, activitySlug: string, infoFileContent: Activity) {
    // List of properties that contain paths of assets to be copied
    const assetsPaths = [
        infoFileContent.previewImage.filename,
        ...infoFileContent?.assets || [] 
    ];
    fs.mkdirSync(path.join(ASSETS_PATH, authorSlug, activitySlug));
    assetsPaths.forEach(asset => {
        const sourcePath = path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, asset);
        const destinationPath = path.join(ASSETS_PATH, authorSlug, activitySlug, asset);
        fs.copyFileSync(sourcePath, destinationPath);
    });
}

function main() {
    // Clean up the generated directories and create new ones
    deleteAndRecreateDirectory(ASSETS_PATH);

    // List all authors
    const authorSlugs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name);

    authorSlugs.forEach(async authorSlug => {
        // Create author folder
        fs.mkdirSync(path.join(ASSETS_PATH, authorSlug));

        // List all activities
        const activitySlugs = fs.readdirSync(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR), { withFileTypes: true })
            .filter(item => item.isDirectory())
            .map(item => item.name);

        // For each activity, copy the referenced assets into the public folder
        activitySlugs.forEach(async activitySlug => {
            const infoFileContent = JSON.parse(fs.readFileSync(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, INFO_FILE), "utf-8"));
            copyAssets(authorSlug, activitySlug, infoFileContent);
        });
    });
}

main();
