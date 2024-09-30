import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ActivityVariant } from '../../src/schemas/activitySchema';
import { JudiciousModule } from '../../src/schemas/documentation';
import { judiciousDocPathname } from '../../src/urlUtils';
import DocElement from './DocElement';

export default function InlineAPI({
  name, language = undefined, module = undefined, activityVariant,
} :
{ name: string,
  language?: string | undefined,
  module?: string | undefined,
  activityVariant: ActivityVariant,
}) {
  // When not provided explicitly, the language is inferred from the activity variant.
  const bestLanguage = language || activityVariant.language;

  // When not provided explicitly, the module assumed to be 'pytamaro'
  // (possibly a language-specific submodule).
  const moduleName = module || (bestLanguage === 'en' ? 'pytamaro' : `pytamaro.${bestLanguage}`);

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
