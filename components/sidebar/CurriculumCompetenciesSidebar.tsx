import { findUserCompetencies } from '../../src/curriculumCompetencies';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import UserCompetenciesStack from '../UserCompetenciesStack';
import SidebarItem from './SidebarItem';

export default function CurriculumCompetenciesSidebar({ curriculum } : { curriculum: Curriculum }) {
  const { metadata } = useLocalProfile();
  const userActivities = metadata.activities;
  const userCompetencies = findUserCompetencies(curriculum, userActivities);
  return userCompetencies.length > 0 ? (
    <SidebarItem title="My Competencies">
      <UserCompetenciesStack curriculum={curriculum} userCompetencies={userCompetencies} direction="column" />
    </SidebarItem>
  ) : null;
}
