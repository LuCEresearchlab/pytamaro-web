# How to Write a JSON file for a Curriculum

A curriculum is structured as follows:

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
      title: string,
      activities: [
        {
          id: activityId // string (<author-slug>/<activity-slug>/<language>/<version>),
          activityRequirements: activityId[][],
          prerequisites: competencyId[],
          learningObjectives: competencyId[]
        },
        ...
      ],
    },
    ...
  ],
}
```
