import useJudiciousDocData from '../../src/documentation';
import { ActivityVariant } from '../../src/schemas/activitySchema';
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

  const modulesData = useJudiciousDocData([moduleName]);
  const element = modulesData.length === 1
   && modulesData[0].elements?.find((el) => el.name === name);

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
