# Structure of Activity Meta-Information

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
      course: string,
      instructors: string[],
      assignment: string,
      url: string,
      hidden?: boolean,
    },
    ...
  ],
}
```
