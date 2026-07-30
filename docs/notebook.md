# How to Write a Notebook for an Activity

## Python Code

Some starter Python code may purposefully have "holes" for learners to fill in.
You can use an ellipsis (`...`) as a placeholder, e.g. `return ...`.

We recommend also to avoid long lines of code (e.g., use a limit of 80 columns as a rule of thumb).
Not only are they often harder to read, but they also require users to scroll horizontally.

## Visibility of Code Cells

You might want to hide some code cells from learners
(e.g., because they contain the solution).
You can do so by adding this special comment in the first line of the code cell:

```python
#teacher-only
...
```

## Images

There are three ways to include an image in your activity:

1. As a Jupyter notebook attachment (some editors such as VSCode support drag-and-drop of images into notebook cells)
2. Only for images already hosted online, you use their URL directly with an `<img>` tag, e.g.:

   ```html
   <img
     alt="Example image"
     src="https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png"
   />
   ```

   (Note: the website has to support security headers such as CORS to allow the image to be displayed in our platform.)

3. For local images (as well as online ones), you have to use the Markdown syntax:

   ```markdown
   ![Example image](example.png)
   ```

   and **add the resource path** to the `assets` array specified in the activity's `info.json` file.

Tip: you can wrap an image in a `<div>` to limit its maximum width, e.g.:

```html
<div style={{ maxWidth: '30%' }}>
![Example image](example.png)
</div>
```

## Special Components

Special components that can be used inline with the text:

- `<API>above</API>` to render a name (e.g., `above`) from the PyTamaro library with a distinguished style
  and an automatic popup to retrieve the documentation.

  The language of the API (e.g., `rettangolo` for PyTamaro in Italian) is automatically chosen based on the language of the activity.
  Optionally, it is possible to specify a `lang` attribute (e.g., `<API lang="en">rectangle</API>` in a German activity) to force a language for the API independently from the language of the activity.

  For selected modules from the standard library, you can use the `module` attribute to specify the module name (e.g., `<API module="math">sqrt</API>`).
  Use the module `builtins` for built-in functions (e.g., `<API module="builtins">print</API>`).
  Use the module `toolbox` for functions from the user's toolbox (e.g., `<API module="toolbox">square</API>`).
  You can also refer to functions and constants from the activity's library (e.g, `<API module="my_library">my_function</API>`).

  When the documentation is not found (e.g., a user does not have a function in their toolbox), the name is simply rendered without any special style or popup.

- `<Activity id="luce/sliced-pitaya/en/v1" fragment="ring-of-seeds">Sliced Pitaya activity</Activity>` to render a link to another activity.
  You can optionally specify a fragment to link to a specific section of the activity. The `id` should refer to a fully qualified activity variant identifier,
  i.e. it should include the author's slug, the activity's slug, the language, and the version.
  The content of the tag will be rendered as the link's text.

Top-level special components that can be used to structure the activity (these need to be separated by at least one blank line from the rest of the Markdown content):

- `<DoNow id="describe-rectangle">How would you describe the figure so that your friend can draw it?</DoNow>` to render a "Do Now" box with the specified content. A "Do Now" box blurs the rest of the activity until the user has clicked on a "I did it" button.
  This forces learners to think before proceeding.
  The `id` must be unique within an activity, so that we can keep track of which "Do Now" boxes the user has already completed and avoid blurring the content again on subsequent visits.
  Optionally, you can add a `requireAnswer` attribute (e.g., `<DoNow id="..." requireAnswer>...</DoNow>`) to force the user to type an answer before being able to unblur the rest of the activity.
- To highlight a task that the user should complete you can use the `<Task>` component:
  ```
  <Task>
  Fill in the missing parts of the code!
  </Task>
  ```

Other special components:

- Material UI's [Stack](https://mui.com/material-ui/react-stack/). For instance, you might want to display multiple images side by side with some spacing:
  ```
  <Stack direction="row" spacing={2} alignItems="flex-end">
    <div>
    ![description 1](img1.svg)
    </div>
    <div>
    ![description 2](img2.svg)
    </div>
  </Stack>
  ```
