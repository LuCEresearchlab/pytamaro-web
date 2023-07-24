<img src="public/PyTamaro-horizontal.png" alt="PyTamaro Logo" style="background-color:white;" />

This repository contains the PyTamaro web plaform, served at https://pytamaro.si.usi.ch.

## Executive Summary: How is this all organized?

The web plaform is implemented using [Next.js](https://nextjs.org/).
The actual content is stored in separate repositories, one for each author, which are imported as git submodules.
Activities are created as [Jupyter notebooks](https://jupyter.org/).

## I am a content author. What do I need to know to operate with submodules?
<details>
<summary>Expand</summary>

Activites and curricula are responsiblity of a certain author and are maintained in external repositories.
See the [Luce repository](https://github.com/LuCEresearchlab/pytamaro-web-luce/) for an example.
Such repositories are imported to this repository as git submodules.

When a new author is added, one of the maintainers needs to create their repository and add it to this one as a submodule.
A script that performs all the necessary steps is available by running:
```sh
npx ts-node tools/newAuthor.mts <author-slug>
```
where `<author-slug>` is the name of the author's repository (e.g., `luce` for the Luce repository).

Set up a local development environment as described in the "How do I set up a development enviroment..." section below.
Then, you can work on your content as usual by making changes to the files in the submodule's folder (`data/<author-slug>/...`). 

When you are ready and want to commit your changes:
1. if not there already, move to a folder inside your submodule:
    ```sh
    cd data/<author-slug>
    ```
1. stage and commit your changes normally (e.g., `git add . && git commit -m "New activity"`)
1. push your changes to the `main` branch of your submodule:
    ```sh
    git push origin HEAD:main
    ```

When you want to integrate your changes into the main repository and see them live on the platform:
1. if not there already, move to a folder inside your submodule:
    ```sh
    cd data/<author-slug>
    ```
1. _only for the first time_, create a new branch named `live` and push it to the remote repository:
    ```sh
    git checkout -b live && git push -u origin live && git checkout main
    ```
1. merge the `main` branch of your submodule into the `live` branch:
    ```sh
    git checkout live && git merge main && git push && git checkout main
    ```

This will trigger a workflow on the LuCE server that tries to build the plaftfrom with the new content.
In case of success, the reference to the submodule in this platform repository will be updated to the new commit.
Finally, the redeployment of the entire platform will be automatically triggered.
The entire process should take less than 10 minutes.
</details>

## I am a content author. What do I need to know to create a new activity?
<details>
<summary>Expand</summary>

See this document for [creating a new activity](docs/activity.md).
</details>

## I am a content author. What do I need to know to create a new curriculum?
<details>
<summary>Expand</summary>

See this document for [creating a new curriculum](docs/curriculum.md).
</details>

## How do I set up a development environment to run the platform locally?
<details>
<summary>Expand</summary>

1. Clone this repository `git clone git@github.com:LuCEresearchlab/pytamaro-web.git`
1. Change directory to the newly cloned repository (e.g., `cd pytamaro-web`) 
1. Clone the submodules you have access to (e.g., `git submodule update --init data/luce`, or `git submodule update --init` to clone all of them)
1. Install the dependencies of this project: `npm install`
1. Populate the `public` folder with notebooks-related assets: `npx ts-node tools/createNotebookAssets.mts`
1. Start the Next.js server: `npm run dev`
1. Browse at [http://localhost:3000](http://localhost:3000)
</details>

## Activities, Curricula... give me a comprehensive picture!
<details>
<summary>Expand</summary>

See this document for [the structure of a content repository](docs/content-repo.md).
</details>

## I am a developer of the platform. Which coding guidelines should I follow?
<details>
<summary>Expand</summary>

We use TypeScript and follow the AirBnB style guide.
Install ESLint in your environment.

We mostly follow the structure prescribed by Next.js:
- `pages` contains pages automatically discovered by Next.js's router
- `pages/api` contains API routes
- `components` contains our custom react components (factored out from pages as much as possible)
- `src` contains "business logic"
- `public` contains public assets
- `tools` contains extra utilities meant to be executed as scripts
</details>

## I am a developer of the platform. How do I deploy it?
<details>
<summary>Expand</summary>

Pushes to the `live` branch trigger an automatic re-deployment.
One liner from the `main` branch:
```sh
git checkout live && git merge main && git push && git checkout main
```
</details>

## I am a developer of the platform. How do I test it?
<details>
<summary>Expand</summary>

1. Start the Next.js server: `npm run dev`
1. Start Cypress by running `npm run cypress` in another terminal window
</details>

## I am a developer of the platform. How do I add a new E2E test?
<details>
<summary>Expand</summary>

Create a new file: `cypress/e2e/[filename].cy.ts`.

Note: since `isolatedModules` is set, the file should contain some import or export (for example, start the file with `export {};`).
</details>

## How is the platform being executed on the server?
<details>
<summary>Expand</summary>

- Set up an instance of `glot` (see the [pytamaro-glot-docker](https://github.com/LuCEresearchlab/pytamaro-glot-docker) repository).
- Create an appropriate `.env.production` in the root folder
- Use `docker compose` to build and start the containers. See how it is currently done in the [luce-server](https://github.com/LuCEresearchlab/luce-server) repository.
</details>

## How is the Python Analyzer built?
<details>
<summary>Expand</summary>

The Python Analyzer in `tools/python-analyzer` is a Rust library
that leverages [RustPython's Parser](https://github.com/RustPython/Parser)
and is compiled to WebAssembly using [`wasm-pack`](https://rustwasm.github.io/wasm-pack/).
Pre-built JavaScript files (for a bundler, usable both by the browser and by Node.js) are already included in this repository at `src/python-analyzer`.
To rebuild the parser, install a Rust toolchain and run `npm run build-python-analyzer`.
