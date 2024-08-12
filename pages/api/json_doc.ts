import { NextApiRequest, NextApiResponse } from 'next';
import { JsonConverter } from '../../src/JsonAst/JsonConverter';
import { LanguageString } from '../../src/JsonAst/Json_structure';

function convertToLanguageString(language: string | undefined) {
  switch (language) {
    case 'en':
      return LanguageString.English;
    case 'fr':
      return LanguageString.French;
    case 'de':
      return LanguageString.German;
    case 'it':
      return LanguageString.Italian;
    default:
      return undefined;
  }
}

const jsonConverter: JsonConverter = new JsonConverter();
jsonConverter.init()
  .then(() => {
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const name = (req.query.name?.toString() ?? '').trim();
  const language = convertToLanguageString(req.query.language?.toString()
    ?.toLowerCase());

  if (name) {
    const result = jsonConverter.find(name, language);
    if (result === undefined) {
      res.status(500)
        .send('No matching result');
    } else {
      res.status(200)
        .json(result);
    }
  } else {
    res.status(400)
      .send('No name defined');
  }
}
