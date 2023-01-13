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

## How to set up a development environment

From the root folder of this repository:

1. Install a version of Jupyter Notebook on your system (e.g., `brew install jupyter`)
2. Install the dependencies of this project: `npm install`
3. Generate the various versions of the notebooks: `node tools/notebooksGenerator.js`
4. Start a Jupyter server: `jupyter server --ServerApp.root_dir='generated_notebooks' --ServerApp.token='75cb9deea88415f4c7c7d8b95b1534b9660d83b8961effd1'`
5. Start the Next.js server: `npm run dev`
6. Browse at [http://localhost:3000](http://localhost:3000)

As an extra requirement,
if you want to be able to execute PyTamaro solutions,
you also need to install `pytamaro` (using the same Python environment your Jupyter server uses).

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

## Deployment

- Create an appropriate `.env.production` in the root folder
- Navigate into the `docker` folder and execute `docker compose build` to build both the NextJS and the Jupyter containers,
and finally `docker compose up` to start them.