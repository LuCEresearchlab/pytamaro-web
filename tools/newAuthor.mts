import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { ACTIVITIES_DIR, CURRICULA_DIR, DATA_DIR } from "./utils.mjs";

const authorSlug = process.argv[2];

// Create new author folder
const authorFolder = fs.mkdtempSync(authorSlug);

// Create new folders for activities and curricula
fs.mkdirSync(path.join(authorFolder, ACTIVITIES_DIR));
fs.mkdirSync(path.join(authorFolder, CURRICULA_DIR));
// Add .gitkeep files to the new folders (so that they get tracked even if they are empty)
fs.writeFileSync(path.join(authorFolder, ACTIVITIES_DIR, ".gitkeep"), "");
fs.writeFileSync(path.join(authorFolder, CURRICULA_DIR, ".gitkeep"), "");

// Create authors.json file
fs.writeFileSync(path.join(authorFolder, "author.json"), JSON.stringify({
    name: "",
    description: ""
}, null, 4));

// Create README
fs.writeFileSync(path.join(authorFolder, "README.md"),
`# Content for pytamaro-web by ${authorSlug}

This is a content repository for PyTamaro-Web platform.
The documentation is available in the [platform repository](https://github.com/LuCEresearchlab/pytamaro-web).
`);

// Create .gitignore
fs.writeFileSync(path.join(authorFolder, ".gitignore"),
`# misc
.DS_Store
*.pem
`);

// Init git repository
execSync(`git init -b main ${authorFolder}`)
// Add files to git
execSync(`git -C ${authorFolder} add .`);
// Commit
execSync(`git -C ${authorFolder} commit -m "Initial commit"`);

const fullRepoName = `LuCEresearchlab/pytamaro-web-${authorSlug}`;

// Create on GitHub
execSync(`gh repo create ${fullRepoName} --source=${authorFolder} --push --private --description "Content by ${authorSlug} for pytamaro-web"`);

// Add it as submodule
const submodulePath = path.join(DATA_DIR, authorSlug);
execSync(`git submodule add --name ${authorSlug} git@github.com:${fullRepoName}.git ${submodulePath}`);

// Add, commit and push
execSync(`git add .gitmodules ${submodulePath}`);
execSync(`git commit -m "Add ${authorSlug} submodule"`);
execSync(`git push`);