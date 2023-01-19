This repository contains the achitecture and the materials for the PyTamaro curriculum website.

## Architecture

### Executive Summary
The web architecture is implemented using [Next.js](https://nextjs.org/),
while the contents (i.e., the learning modules) are stored as [Jupyter notebooks](https://jupyter.org/).

### Learning modules
Learning modules are stored each in one folder inside the `learning_modules` folder.
The name of the folder should use hyphens and determines the _slug_ of the module,
which uniquely identifies it.
See the `swiss-flag` module for an example.

Each learning module can exists in several variants,
depending on:
- the _target person_ (either a student or a teacher);
- the _natural language_ (e.g, English, Italian or German).

Our default mandatory variant is in _English_ for a _student_.

All the meta-information about a learning module is specified in an `info.json` file.
See `learning_modules/swiss-flag/info.json` for an example.
Each variant is described by an object containing:
- the localized `title`,
- the natural language `language` in the ISO 639-1 format,
- the `target` person (`"student"` or `"teacher"`).

These pieces of information prescribe the name of the Jupyter notebook file
for that variant (`slug-language-target.ipynb`).

Each module variant causes the generation of a separate notebook.
In addition, revisions to each Jupyter notebook are tracked using `git`:
a separate notebook is generated for each revision,
named after the hash of the commit that modified the file.
Finally, a `latest` version is always generated with the current content of the file.

When creating a notebook, embed resources (such as images) as attachments.

Additionally, the object describing a module contains the following fields:
- `previewImage`: filename of a preview image to be shown in the gallery
- `visibility`: one of `"visible"` (the module is shown normally in the gallery), `"draft"` (the module is shown with a special label in the gallery and can only be accessed using a direct link), or `"hidden"` (the module is not shown at all in the gallery).

## How to set up a development environment

From the root folder of this repository:

1. Install the dependencies of this project: `npm install`
2. Generate the various versions of the notebooks: `node tools/notebooksGenerator.js`
3. Start the Next.js server: `npm run dev`
4. Browse at [http://localhost:3000](http://localhost:3000)

## Coding guidelines

We use TypeScript and follow the AirBnB style guide.
Install ESLint in your environment.

We mostly follow the structure prescribed by Next.js:
- `pages` contains pages automatically discovered by Next.js's router
- `pages/api` contains API routes
- `components` contains our custom react components (factored out from pages as much as possible)
- `src` contains "business logic"
- `public` contains public assets
- `tools` contains extra utilities meant to be executed as scripts

## How to deploy

Pushes to the `live` branch trigger an automatic re-deployment.
One liner from the `main` branch:
```sh
git checkout live && git merge main && git push && git checkout main
```

## Configure Deployment

- Set up an instance of `glot` (see the `pytamaro-docker` repo)
- Create an appropriate `.env.production` in the root folder
- Navigate into the `docker` folder; execute `docker compose build` to build the NextJS container and `docker compose up` to start it
