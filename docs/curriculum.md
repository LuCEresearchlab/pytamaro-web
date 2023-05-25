# How to Create a Curriculum

Inside your `data/<author-slug>` folder, curricula are stored in the `curricula` folder as files named `<curriculum-slug>.json`. 

The name of the file should use hyphens and determines the _slug_ of the curriculum,
which uniquely identifies it.

The file specifies all the meta-information about a curriculum.
See the documentation for [how to structure the file](curriculum-json.md).
See the [`comprehensive` curriculum inside the `luce` folder](../data/luce/curricula/comprehensive.json) for an example.

The object describing a curriculum contains the following fields:
- `title`: the title of the curriculum
- `description`: the description of the curriculum
- `visibility`: ignored for now
- `competencies`: an array of objects with an `id`, `name`, `description`, `longDescription`, and `icon` (the name of a [Material Icon](https://mui.com/material-ui/material-icons/) representing the competency).
- `units`: an array of objects with a `title` and `steps`. Each unit represents a sequence of `steps` that must be completed in order.
  - Each step contains multiple alternative `activities`; learners are required to complete at least one of them to complete the step. A step can be optional by setting `isOptional` to `true`.
    - Each activity has an `id` with the fully-qualified name of the activity (`<author-slug>/<activity-slug>/<language>/<version>`), `prerequisites` listing competencies that learners are expected to have gained, and `learningObjectives` listing competencies that learners are expected to gain.
