# Structure of Curriculum Meta-Information

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
      category: 'programming' | 'graphics',
    },
    ...
  ],
  units: [
    {
      title: string,
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
  derivedFrom: curriculumId[], // string (<author-slug>/<curriculum-slug>)
}
```

