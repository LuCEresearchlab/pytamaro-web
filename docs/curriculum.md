# How to Create a Curriculum

Inside your `data/<author-slug>` folder, curricula are stored in the `curricula` folder as files named `<curriculum-slug>.json`. 

The name of the file should use hyphens and determines the _slug_ of the curriculum,
which uniquely identifies it.

The file specifies all the meta-information about a curriculum.
See the documentation for [how to structure the file](curriculum-json.md).
See the [`comprehensive` curriculum inside the `luce` folder](../data/luce/curricula/comprehensive.json) for an example.

The object describing a curriculum contains the following fields:
- `title`: the title of the curriculum
- `description`: the description of the curriculum (supports Markdown)
- `visibility`: either `'visible'` or `'hidden'`. Hidden curricula are not shown on the platform, but can still be accessed with a direct link or by a user who has already started them.
- `activitiesPreviewImage`: an optional list of activity IDs that belong to this curriculum and are to be preferred when generating a preview image for the curriculum
- `orderingKey`: an optional key used to lexicographically sort lists of curricula (when not provided, the slug of the curriculum is used instead) 
- `competencies`: an array of objects with an `id`, `name`, `description`, `longDescription` (supports Markdown), `icon` (the name of a [Material Icon](https://mui.com/material-ui/material-icons/) representing the competency), and `category` (whether the competency is about learning a general `programming` skill or about `graphics`).
- `units`: an array of objects with a `title` and `steps`. Each unit represents a sequence of `steps` that must be completed in order.
  - Each step contains multiple alternative `activities`; learners are required to complete at least one of them to complete the step. A step can be optional by setting `isOptional` to `true`.
    - Each activity has an `id` with the fully-qualified name of the activity (`<author-slug>/<activity-slug>/<language>/<version>`), `prerequisites` listing competencies that learners are expected to have gained, and `learningObjectives` listing competencies that learners are expected to gain.
- `derivedFrom`: an (optional) array of curriculum IDs from which this curriculum has been derived (e.g., by borrowing significant parts). IDs are fully-qualified identifiers of curricula, i.e. in the form `<author-slug>/<curriculum-slug>`. This information is used for attribution.
- `hourOfCode`: an (optional) boolean to indicate whether this curriculum is meant to be run as an Hour Of Code.
- `finishURL`: an (optional) URL, absolute or relative, to replace the default URL users are redirected to when they finish the curriculum.
- `finishLabel`: an (optional) label for the finish button, to replace the deafult label "Finish".
- `allActivitiesUnlocked`: (optional, defaults to `false`) when set to `true`, all the activities in this curriculum are available immediately after starting it. 