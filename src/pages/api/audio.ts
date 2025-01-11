
import type { NextApiRequest, NextApiResponse } from "next";
import { uploadAudioToStorage, transcribeAudio } from "~/server/functions";
import { v4 as uuid } from "uuid";   
import type formidable from "formidable";
import { IncomingForm } from "formidable";
import fs from "fs/promises";

type ResponseData = {
  message: string,
  error: string
} 
 
export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try { 
    const form = new IncomingForm();  
    const [_fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(function (resolve, ) {
      form.parse(req, (err, fields, files) => {   
        resolve([fields, files]);
      });
    });  
    const file = files.audio; 
    const path = file?.[0]?.filepath ?? "";
    const buffer = await fs.readFile(path); 
    const pathToAudio = await uploadAudioToStorage(buffer, `${uuid()}.mp3`);
    const text = await transcribeAudio(pathToAudio); 
    res.status(200).json({ message: (text ?? ""), error: "" });  
    return;
  } catch (error) {
    console.log(error); 
    res.status(400).json({ error: "Error", message: "Unable to transcribe audio" });
    return;
  }
}

export const config = {
  api: {
    responseLimit: false, 
    bodyParser: false
  },
};