# Structure of Curriculum Meta-Information

```javascript
{
  title: string,
  description: string, // markdown supported 
  visibility: 'visible' | 'hidden',
  activitiesPreviewImage?: activityId[],
  orderingKey?: string,
  hourOfCode?: boolean,
  finishURL?: string,
  finishLabel?: string,
  allActivitiesUnlocked?: boolean,
  competencies: [
    {
      id: competencyId, // string
      name: string,
      description: string,
      longDescription: string, // markdown supported
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

