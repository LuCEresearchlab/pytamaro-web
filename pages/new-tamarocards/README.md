# Info on the latest implementation of the project

Got rid of the big wall of text that was the inital localization+icons json file and replaced it with a simpler way of adding a translation.

#### Adding a function

To add a function, add the translation for it in `public/locales`, once every language has its own translation of the function, it will already appear when rendering. But, if the function has icons, you'll need to add them in the `public/function_svgs` folder; to do this you'll need to name each svg and the folder with a speciific format:

- **Folder**: `{function_name}`
- **Main Icon**: `{function_name}_icon.svg`
- **Input Icons**: `{function_name}_in_{idx}.svg` (i.e. for above, which has 2 input icons, there are `above_in_1.svg` and `above_in_2.svg`, they will be displayed in the order specified)
- **Output Icons**: `{function_name}_out.svg`

This format is necessary for correct reading of folders and paths in `index.tsx`

#### Adding a language

To add a new language to the translation system, add a new folder under `public/locales` with the abbreviation of the chosen language (i.e. 'pt' for 'Portugese');
in this folder, add a new file called `tamarocards.json` and add a translation for all the present functions (format: `{ "english_function_name": "translated_function_name", ...}`)
