import { findUserCompetencies } from '../../src/curriculumCompetencies';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import UserCompetenciesStack from '../UserCompetenciesStack';
import SidebarItem from './SidebarItem';

export default function CurriculumCompetenciesSidebar({ curriculum } : { curriculum: Curriculum }) {
  const { metadata } = useLocalProfile();
  const { t } = useLocalTranslation(['curriculum']);
  const userActivities = metadata.activities;
  const userCompetencies = findUserCompetencies(curriculum, userActivities);
  return userCompetencies.length > 0 ? (
    <SidebarItem title={t('myCompetencies')}>
      <UserCompetenciesStack curriculum={curriculum} userCompetencies={userCompetencies} direction="column" />
    </SidebarItem>
  ) : null;
}
