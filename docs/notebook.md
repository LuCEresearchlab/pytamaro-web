# How to Write a Notebook for an Activity

## Python Code
All the Python code written in notebooks cells should at least parse (i.e., there should be no syntax errors).
This includes the Python code that purposefully might have "holes" for learners to fill in.
You can use an ellipsis (`...`) as a placeholder, e.g. `return ...`.

The platform automatically checks the validity of all Python cells before building the application.
You can run the same check and see possible errors using:
```sh
npx ts-node tools/checkNotebookSourceCode.mts`
```

## Images

There are three ways to include an image in your activity:
- as a Jupyter notebook attachment (some editors supports drag-and-drop)
- using the standard HTML `<img>` tag referring to an external URL, e.g.
  ```html
  <img alt="Example image" src="https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png" />
  ```
- using the standard HTML `<img>` tag referring to a file in the activity's directory; please use a **relative path**:
  ```html
  <img alt="Example image" src="example.png" />
  ```
  and **add the resource** to the array of `assets` specified in the activity's `info.json` file.

## General remarks

- Include slash in every self-closing tag (for example, write `<br/>` instead of `<br>`).
- To create cells only for teachers, its first line should be `#teacher-only`.
- To create cells for both students and teachers, its first line should be `#student-teacher`.

## Special Components

Special components that can be used:

- `<API>above</API>` to render a name (e.g., `above`) from the PyTamaro library with the appropriate style
  and automatic link to the documentation.
- `<ReactPlayer url='...' />` (see [more on usage](https://github.com/cookpete/react-player)).
- Material UI's [Stack](https://mui.com/material-ui/react-stack/).