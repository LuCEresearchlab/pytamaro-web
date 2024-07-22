import {NextApiRequest, NextApiResponse} from "next";
import {JsonConverter} from "../../src/JsonAst/JsonConverter";
import {language_string} from "../../src/JsonAst/Json_structure.ts";

const jsonConverter: JsonConverter = new JsonConverter()
jsonConverter.init().then(() => {})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const name = (req.query.name?.toString() ?? "").trim();
    let language = convertToLanguageString(req.query.language?.toString()?.toLowerCase());

    if (name) {
        const result = jsonConverter.find(name, language);
        if (result == undefined) {
            res.status(500).send("No matching result");
        } else {
            res.status(200).json(result);
        }
    } else {
        res.status(400).send("No name defined");
    }
}

function convertToLanguageString(language: string | undefined){
    switch (language){
        case "en":
            return language_string.English
        case "fr":
            return language_string.French
        case "de":
            return language_string.German
        case "it":
            return language_string.Italian
        default:
            return undefined
    }
}
