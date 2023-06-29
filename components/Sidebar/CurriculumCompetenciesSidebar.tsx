import { findUserCompetencies } from '../../src/curriculumCompetencies';
import { ActivityVariantMetadata } from '../../src/localStorage/schema';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import UserCompetenciesStack from '../UserCompetenciesStack';
import SidebarTitle from './SidebarTitle';

export default function CurriculumCompetenciesSidebar({ curriculum, userActivities } :
{ curriculum: Curriculum,
  userActivities: ActivityVariantMetadata[] }) {
  const userCompetencies = findUserCompetencies(curriculum, userActivities);
  return userCompetencies.length > 0 ? (
    <>
      <SidebarTitle>
        My Competencies
      </SidebarTitle>
      <UserCompetenciesStack curriculum={curriculum} userCompetencies={userCompetencies} direction="column" />
    </>
  ) : null;
}
