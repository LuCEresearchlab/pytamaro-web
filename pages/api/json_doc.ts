import {NextApiRequest, NextApiResponse} from "next";
import {JsonConverter} from "../../src/JsonAst/JsonConverter.ts";

const jsonConverter: JsonConverter = new JsonConverter()
await jsonConverter.init()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    // console.log("REQUEST: ", req)
    // console.log("REQUEST BODY: ", req.body)

    // const result =  jsonConverter.find('Color', 'en');
    // const result =  jsonConverter.find('Color');
    // res.status(200).send(result)

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
