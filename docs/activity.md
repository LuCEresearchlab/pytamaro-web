# How to Create an Activity

Inside your `data/<author-slug>` folder, activities are stored in the `activities` folder. 

The name of the folder should use hyphens and determines the _slug_ of the activity,
which uniquely identifies it.
See [the `swiss-flag` activity inside the `luce` folder](../data/luce/activities/swiss-flag) for an example.

Each activity can exists in several variants, depending on the _natural language_ in which it is written
(e.g, English, Italian or German).

All the meta-information about an activity is specified in an `info.json` file.
See the documentation for [how to structure the file](activity-json.md).
See `data/luce/activities/swiss-flag/info.json` for an example.
Each variant is described by an object containing:
- the localized `title`,
- the natural language `language` in the ISO 639-1 format,
- the `latestVersion`.

These pieces of information prescribe the name of the Jupyter notebook file
for that variant (`slug-language-version.ipynb`).

There is a specific separate documentation [on how to write a notebook for an activity](notebook.md).

Small changes (such as fixing a typo, or improving the wording of a markdown cell in a notebook)
should not be created in a new version.
On the other hand, major changes, including all the ones that involve the addition/removal of cells
should be created in a new version.

Note that user edits are persisted in the browser's local storage only with respect to a specific version.

Additionally, the object describing an activity contains the following fields:
- `previewImage`: an object containing the `filename` of a preview image and its `backgroundColor`, to be used in the gallery
- `visibility`: one of `"featured"` (shown first in the gallery with a special mark), `"visible"` (shown with normal priority in the gallery), `"draft"` (shown with a special "Coming soon" label in the gallery and only accessible using a direct link), or `"hidden"` (the activity is not shown at all in the gallery).
- `assets`: an array of strings naming the resources used in the Jupyter notebooks.
- `uses`: an (optional) array of assignments that use the activity. Each assignment is an object containing its `course` name, the `instructurs` of the course, the `assignment` name, its `url`, and the `institution` of the course. If a `course` has the optional attribute `hidden` set to `true`, then the use is not shown in activity info page.
- `derivedFrom`: an (optional) array of activity variant IDs from which this activity has been derived (e.g., by translating it). IDs are fully-qualified identifiers of activity variants, i.e. in the form `<author-slug>/<activity-slug>/<language>/<version>`. This information is used for attribution.

When an activity requires some extra Python files to be included for the execution (e.g., a small library, or a dataset):
- Store the files somewhere inside a folder named `python-files` inside your author's folder
- Refer to such files in the `info.json` for an activity under the key `extraPythonFiles`. It requires an array of objects specifying the source path of the file (relative to the `python-files` base folder) and the destination path (potentially just a filename) that the user will need to import from.
    The `warming-stripes` activity by `luce` contains an example of how to achieve this:
    ```json
      "extraPythonFiles": [
        {
          "sourcePath": "warming_stripes/southern_switzerland_data.py",
          "destinationPath": "data.py"
        }
      ]
    ``` 