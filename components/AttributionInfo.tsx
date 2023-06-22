import { Link, Typography } from '@mui/material';
import { activityVariantFromId } from '../src/schemas/activitySchema';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { curriculumFromId } from '../src/schemas/curriculumSchema';
import { activityVariantPathname, authorPathname, curriculumPathname } from '../src/urlUtils';

export default function AttributionInfo({ type, author, derivedFrom } :
{ type: 'activity' | 'curriculum', author: AuthorProfile, derivedFrom: string[] }) {
  const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  const parts = formatter.formatToParts(derivedFrom);
  return (
    <>
      <Typography>
        This
        {' '}
        {type}
        {' '}
        has been created by
        {' '}
        <Link href={authorPathname(author.slug)}>{author.name}</Link>
        {' '}
        and is licensed under
        {' '}
        <Link href="http://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="license noopener noreferrer">CC BY-SA 4.0</Link>
        .
      </Typography>
      {parts.length > 0 && (
        <Typography>
          It is derived from
          {' '}
          {parts.map((part) => {
            if (part.type === 'literal') {
              return part.value;
            }
            let pathname;
            if (type === 'activity') {
              const variant = activityVariantFromId(part.value);
              pathname = activityVariantPathname(variant);
            } else {
              const curriculum = curriculumFromId(part.value);
              pathname = curriculumPathname(curriculum.authorSlug, curriculum.curriculumSlug);
            }
            return (
              <Link key={part.value} href={pathname}>
                this
                {' '}
                {type}
              </Link>
            );
          })}
          .
        </Typography>
      )}
    </>
  );
}
