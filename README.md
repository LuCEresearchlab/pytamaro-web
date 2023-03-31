This repository contains the achitecture and the materials for the PyTamaro curriculum website.

## Architecture

### Executive Summary
The web architecture is implemented using [Next.js](https://nextjs.org/),
while the contents (i.e., the activities) are stored as [Jupyter notebooks](https://jupyter.org/).

### Activities
Activities are stored each in one folder inside the `data/<author-slug>/activities` folder.
The name of the folder should use hyphens and determines the _slug_ of the module,
which uniquely identifies it.
See the `swiss-flag` module for an example.

Each activity can exists in several variants,
depending on:
- the _natural language_ (e.g, English, Italian or German).

Our default mandatory variant is in _English_.

All the meta-information about an activity is specified in an `info.json` file.
See `data/luce/activities/swiss-flag/info.json` for an example.
Each variant is described by an object containing:
- the localized `title`,
- the natural language `language` in the ISO 639-1 format,
- the `latestVersion`.

These pieces of information prescribe the name of the Jupyter notebook file
for that variant (`slug-language-version.ipynb`).

There is a specific separate documentation [on how to write a notebook for an activity](docs/notebook.md).

Small changes (such as fixing a typo, or improving the wording of a markdown cell in a notebook)
should not be created in a new version.
On the other hand, major changes, including all the ones that involve the addition/removal of cells
should be created in a new version.

Note that user edits are persisted in the browser's local storage only with respect to a specific version.

Additionally, the object describing a module contains the following fields:
- `previewImage`: an object containing the `filename` of a preview image and its `backgroundColor`, to be used in the gallery
- `visibility`: one of `"featured"` (shown first in the gallery with a special mark), `"visible"` (shown with normal priority in the gallery), `"draft"` (shown with a special "Coming soon" label in the gallery and only accessible using a direct link), or `"hidden"` (the module is not shown at all in the gallery).

## How to set up a development environment

1. Clone this repository and all its submodules: `git clone --recurse-submodules git@github.com:LuCEresearchlab/pytamaro-web.git` 
1. Install the dependencies of this project: `npm install`
1. Populate the `public` folder with notebooks-related assets: `node tools/createNotebookAssets.js`
1. Start the Next.js server: `npm run dev`
1. Browse at [http://localhost:3000](http://localhost:3000)

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
- Navigate into the `docker` folder; execute `docker-compose --env-file ../.env.production build` to build the NextJS and Redis containers, and `docker compose --env-file ../.env.production up` to start them.
