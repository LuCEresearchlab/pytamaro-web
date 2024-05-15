import {NextApiRequest, NextApiResponse} from "next";
import {JsonConverter} from "../../src/JsonAst/JsonConverter.ts";

const jsonConverter: JsonConverter = new JsonConverter()
await jsonConverter.init()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    const name = req.query.name?.toString()
    const language = req.query.language?.toString()
    console.log("NAME: ",name, " LANGUAGE: ", language)
    if(name != undefined) {
        const result = jsonConverter.find(name, language)
        if(result == undefined){
            res.status(500).send("No matching result")
        } else {
            res.status(200).json(result)
            res.end()
        }
    }
    else{
        res.status(500).send("No name defined")
    }
}
