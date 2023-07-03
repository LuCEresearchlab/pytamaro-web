import { findUserCompetencies } from '../../src/curriculumCompetencies';
import { ActivityVariantMetadata } from '../../src/localStorage/schema';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import UserCompetenciesStack from '../UserCompetenciesStack';
import SidebarItem from './SidebarItem';

export default function CurriculumCompetenciesSidebar({ curriculum, userActivities } :
{ curriculum: Curriculum,
  userActivities: ActivityVariantMetadata[] }) {
  const userCompetencies = findUserCompetencies(curriculum, userActivities);
  return userCompetencies.length > 0 ? (
    <SidebarItem title="My Competencies">
      <UserCompetenciesStack curriculum={curriculum} userCompetencies={userCompetencies} direction="column" />
    </SidebarItem>
  ) : null;
}
