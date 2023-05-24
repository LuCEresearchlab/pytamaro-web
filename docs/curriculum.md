# How to Create a Curriculum

To create a curriculum,

1. Add a file called `<curriculum-slug>.json` to the `curricula` directory.
2. Write a JSON object with the following structure:

```javascript
{
  title: string,
  description: string,
  visibility: 'featured' | 'visible' | 'draft' | 'hidden',
  competencies: [
    {
      id: competencyId // string,
      name: string,
      description: string,
      longDescription: string,
      icon: string,
    },
    ...
  ],
  units: [
    {
      title?: string,
      steps: [
        {
          activities: [
            {
              id: activityId // string (<author-slug>/<activity-slug>/<language>/<version>),
              prerequisites: competencyId[],
              learningObjectives: competencyId[]
            },
            ...
          ],
          isOptional?: boolean,
        },
        ...
      ],
    },
    ...
  ],
}
```
