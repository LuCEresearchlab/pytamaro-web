import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ActivityVariant } from '../../src/schemas/activitySchema';
import { JudiciousModule } from '../../src/schemas/documentation';
import { judiciousDocPathname } from '../../src/urlUtils';
import DocElement from './DocElement';

export default function PyTamaroAPI({
  name, language = undefined, activityVariant,
} :
{ name: string,
  language?: string | undefined,
  activityVariant: ActivityVariant,
}) {
  // When not provided explicitly, the language is inferred from the activity variant.
  const bestLanguage = language || activityVariant.language;

  const moduleName = bestLanguage === 'en' ? 'pytamaro' : `pytamaro.${bestLanguage}`;

  const modulesResults = useQuery({
    queryKey: [moduleName],
    queryFn: (): Promise<JudiciousModule> => axios.get(judiciousDocPathname(moduleName))
      .then((response) => response.data),
  });
  const element = modulesResults.data?.elements?.find((el) => el.name === name);

  return (
    element ? (
      <DocElement
        module={moduleName}
        element={element}
        activityVariant={activityVariant}
        smallerFont={false}
      />
    ) : <span>{name}</span>
  );
}
