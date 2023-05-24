# How to Create an Activity

To create an Activity,

1. Add a file called `<activity-slug>/info.json` to the `activities` directory.
2. Write a JSON object with the following structure:

```javascript
{
  variants: [
    {
      title: string,
      language: string,
      description: string,
      latestVersion: string,
    },
    ...
  ],
  previewImage: {
    filename: string,
    backgroundColor: string,
  },
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  assets: string[],
  uses: [
    {
      institution: string,
      course: string | 'internal', // not shown in activity info page if 'internal'
      instructors: string[],
      assignment: string,
      url: string,
    },
    ...
  ],
}
```
