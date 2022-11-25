const fs = require("node:fs/promises");
const path = require("node:path");
const simpleGit = require("simple-git");

const SOURCE_NOTEBOOKS_DIR = "learning_modules";
const GENERATED_NOTEBOOKS_DIR = "generated_notebooks";
const INFO_FILE = "info.json";
const CURRENT_VERSION_REVISION_NAME = "latest";
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
    await deleteAndRecreateDirectory(GENERATED_NOTEBOOKS_DIR);
    await deleteAndRecreateDirectory(ASSETS_PATH);

    // List all learning modules
    const slugs = (await fs.readdir(SOURCE_NOTEBOOKS_DIR, { withFileTypes: true }))
        .filter(item => item.isDirectory())
        .map(item => item.name);

    // For each learning module, discover all its variants using the INFO_FILE
    // (languages / target audience).
    slugs.forEach(async slug => {
        await fs.mkdir(path.join(GENERATED_NOTEBOOKS_DIR, slug));
        
        const infoFileContent = JSON.parse(await fs.readFile(path.join(SOURCE_NOTEBOOKS_DIR, slug, INFO_FILE)));

        await copyAssets(slug, infoFileContent);

        const notebookVariants = infoFileContent.variants;
        // For each variant, use git to track all the revisions at which the
        // file was modified. Then, generate a file for each revision with the
        // content it used to have. Furthermore, generate a file with the *current*
        // content of the notebook, regardless of its status as tracked by git.
        // The "revision hash" for the current version is CURRENT_VERSION_REVISION_NAME.
        notebookVariants.forEach(async notebook => {
            const notebookFileName = `${slug}-${notebook.language}-${notebook.target}.ipynb`;
            const notebookPath = path.join(SOURCE_NOTEBOOKS_DIR, slug, notebookFileName);
            const notebookRevisions = (await simpleGit().log({ file: notebookPath })).all;
            const revisionHashes = notebookRevisions.map(revision => revision.hash);
            revisionHashes.push(CURRENT_VERSION_REVISION_NAME);
            revisionHashes.forEach(async revisionHash => {
                const notebookContentAtRevision = await (revisionHash === CURRENT_VERSION_REVISION_NAME
                                                    ? fs.readFile(notebookPath)
                                                    : simpleGit().show([`${revisionHash}:${notebookPath}`]));
                const generatedNotebookFileName = `${slug}-${notebook.language}-${notebook.target}-${revisionHash}.ipynb`;
                await fs.writeFile(path.join(GENERATED_NOTEBOOKS_DIR, slug, generatedNotebookFileName), notebookContentAtRevision);
            })
        });
    });
}

main();