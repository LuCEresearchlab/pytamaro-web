import { Link, Typography } from '@mui/material';
import { Trans } from 'next-i18next';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { activityVariantFromId } from '../src/schemas/activitySchema';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { curriculumFromId } from '../src/schemas/curriculumSchema';
import {
  activityVariantPathname,
  authorPathname,
  curriculumPathname,
} from '../src/urlUtils';

export default function AttributionInfo({
  type,
  author,
  derivedFrom,
}: {
  type: 'activity' | 'curriculum';
  author: AuthorProfile;
  derivedFrom: string[];
}) {
  const { i18n, t } = useLocalTranslation();
  const formatter = new Intl.ListFormat(i18n.language, {
    style: 'long',
    type: 'conjunction',
  });
  const parts = formatter.formatToParts(derivedFrom);
  return (
    <>
      <Typography>
        <Trans
          t={t}
          i18nKey={`${type}CreatedByLicensedUnder`}
          values={{ authorName: author.name, license: 'CC BY-SA 4.0' }}
          components={{
            authorLink: <Link href={authorPathname(author.slug)} />,
            licenseLink: (
              <Link
                href='http://creativecommons.org/licenses/by-sa/4.0'
                target='_blank'
                rel='license noopener noreferrer'
              />
            ),
          }}
        />
      </Typography>
      {parts.length > 0 && (
        <Typography>
          {t(`${type}DerivedFrom`)}{' '}
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
              pathname = curriculumPathname(
                curriculum.authorSlug,
                curriculum.curriculumSlug,
              );
            }
            return (
              <Trans
                key={part.value}
                t={t}
                i18nKey={`${type}This`}
                components={{ a: <Link href={pathname} /> }}
              />
            );
          })}
          .
        </Typography>
      )}
    </>
  );
}
