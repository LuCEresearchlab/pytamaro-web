# How to Write a Notebook for an Activity

## General

- Embed resources (such as images) as attachments.
- Include slash in every self-closing tag (for example, write `<br/>` instead of `<br>`).
- To create cells only for teachers, its first line should be `#teacher-only`.
- To create cells for both students and teachers, its first line should be `#student-teacher`.

## Special Components

Special components that can be used:

- `<API>above</API>` to render a name (e.g., `above`) from the PyTamaro library with the appropriate style
  and automatic link to the documentation.
- `<ReactPlayer url='...' />` (see [more on usage](https://github.com/cookpete/react-player)).
- Material UI's [Stack](https://mui.com/material-ui/react-stack/).