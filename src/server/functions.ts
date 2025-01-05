import youtubeStream from "yt-stream"; 
import {Storage} from "@google-cloud/storage"; 
import OpenAI from "openai";   
import { pipeline } from "stream/promises";
import { type Readable } from "stream";
import { type StrucutredOutput } from "~/types";
import vision from "@google-cloud/vision"; 

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

const gcpPath = "audio-1-transcribe";
const gcpPathImage = "image-1-text"; 
const encodedGcp = process.env.gcpEncoded ?? "";

const getClientCredentials = () => { 
  const decodedServiceAccount = Buffer.from(encodedGcp, "base64").toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount) as {project_id: string, private_key: string, client_email: string};
  return credentials;
};

export const uploadImageToStorage = async (dataUri: string, imageName: string) => {
  const credentials = getClientCredentials();
  const gcp_storage = new Storage(
    {
      projectId: credentials.project_id,
      credentials: credentials,
    }
  ); 
  console.log("Accessing storage  . . . . . "); 
  const matches = /^data:([A-Za-z-+\/]+);base64,(.+)$/.exec(dataUri); 
  try { 
    const fileContents = Buffer.from(matches?.[2] ?? "", "base64");
    const bucket = gcp_storage.bucket(gcpPathImage);

    const expirationDate = new Date();
    const daysTillExpiration = 1;
    expirationDate.setDate(expirationDate?.getDate() + daysTillExpiration); 

    const file = bucket.file(imageName);
    await file.save(fileContents, {
      metadata: {
        contentType: matches?.[1],
        metadata: {
          expires: expirationDate.toISOString(),
          "Custom-Time": expirationDate.toISOString(),
        },
      },
    });
    await file.setMetadata({
      metadata: {
        expires: expirationDate.toISOString(),
        "Custom-Time": expirationDate.toISOString(),
      },
    });
    console.log("Successfully uploaded image to storage . . . . . ");
    const pathOfImage = `gs://${gcpPathImage}/${imageName}`;
    return pathOfImage;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log("Failed", (error as {stack: any}).stack);
  }
};

export const extractTextFromImage = async (imagePath: string) => { 
  const credentials = getClientCredentials();
  const client = new vision.ImageAnnotatorClient({
    projectId: credentials.project_id,
    credentials: credentials,
  });
  const [result] = await client.textDetection(`${imagePath}`);
  const detections = result.textAnnotations; 
  let extractedText = "";
  const text = detections?.[0]?.description;
  if (text) {
    extractedText = text;
  }
  extractedText = extractedText.replaceAll(/\n/g, " ");
  return extractedText;
};

export const verifyYoutubeUrl = (url: string): boolean => {
  let isValid = true; 
  const verifyUrl = youtubeStream.validateURL(url);
  if (!verifyUrl) {
    isValid = false;
  }
  const verifyVideo = youtubeStream.validateVideoURL(url);
  if (!verifyVideo) {
    isValid = false;
  }
  return isValid;
};

export const getYoutubeAudio = async (url: string, quality="low"): Promise<Readable> => {
  try {
    youtubeStream.setApiKey(process.env.YOUTUBE_API_KEY ?? ""); 
    youtubeStream.setPreference("api"); 
    const info = await youtubeStream.getInfo(url); 
    console.log(`Video title: ${info.title} - ${info.id}`); 
    const audioStream = await youtubeStream.stream(url, {
      quality: quality as youtubeStream.quality,
      type: "audio",
      highWaterMark: 1024 * 1024 * 10,
      download: false,
    });
 
    return audioStream.stream;
  } catch (error) {
    console.log(error); 
    throw new Error("Failed to upload audio to storage");
  }
};

export const uploadBufferToBucket = async (buffer: Buffer, fileName: string, mimeType: string, _bucket: string) => {
  const credentials = getClientCredentials();
  const gcp_storage = new Storage(
    {
      projectId: credentials.project_id,
      credentials: credentials,
    }
  ); 
  console.log("Accessing storage  . . . . . ");
  const bucket = gcp_storage.bucket(_bucket);
  const file = bucket.file(fileName);
  console.log("Uploading audio to storage . . . . . ");
  const writeStream = file.createWriteStream({
    metadata: {
      contentType: mimeType,
    },
  });
  await pipeline(buffer, writeStream).catch((error) => {
    console.log(error);
    throw new Error("Failed to upload audio to storage");
  }).then(() => {
    console.log("Uploaded to storage . . . . . ");
  }).finally(() => {
    console.log("Closing stream . . . . . ");
    writeStream.end();
  });
};

export const uploadAudioToStorage = async (url: string) => {
  try {
    youtubeStream.setApiKey(process.env.YOUTUBE_API_KEY ?? ""); 
    youtubeStream.setPreference("api"); 
    const info = await youtubeStream.getInfo(url); 
    console.log(`Video title: ${info.title} - ${info.id}`);
    // Get the audio stream
    const audioStream = await youtubeStream.stream(url, {
      quality: "low",
      type: "audio",
      highWaterMark: 1024 * 1024 * 10,
      download: false,
    });
    const credentials = getClientCredentials();
    const gcp_storage = new Storage(
      {
        projectId: credentials.project_id,
        credentials: credentials,
      }
    ); 
    console.log("Accessing storage  . . . . . ");

    const bucket = gcp_storage.bucket(gcpPath);
    const newFile = `${info.id}.m4a`;
    const file = bucket.file(newFile, );

    console.log("Uploading audio to storage . . . . . ");
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: "audio/mpeg",
      },
    });

    await pipeline(audioStream.stream, writeStream).catch((error) => {
      console.log(error);
      throw new Error("Failed to upload audio to storage");
    }).then(() => {
      console.log("Audio uploaded to storage . . . . . ");
    }).finally(() => {
      console.log("Closing stream . . . . . ");
      audioStream.stream.destroy();
      writeStream.end();
    });

    // Start downloading the audio 

    return "asd"+".m4a";
  } catch (error) {
    console.log(error);
    throw new Error("Failed to upload audio to storage");
  }
};

export const factCheckerParagraphv1 = async (raw: string, model?: string) => { 
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a fact-checking assistant. Respond to queries in this structured JSON format: " +
            "{\"validity\": \"true/false\", \"reason\": \"reasoning text\", \"sources\": [\"source1\", \"source2\"]}." +
            "For example, {\"validity\": \"true\", \"reason\": \"The statement is true because...\", \"sources\": [\"source1\", \"source2\"]}" + 
            "If you are unable to fact-check the statement, please respond with {\"validity\": \"unavailble\", \"reason\": \"unavailble\", \"sources\": [\"unavailble\"]}" +
            "Ensure that the sources are valid URLs.",
        },
        { role: "user", content: `Fact-check this statement: "${raw}"` },
      ], 
    });
    const result = response.choices[0]?.message.content; 
    if(result && result.trim() !== "") {
      const asObejct = JSON.parse(result) as StrucutredOutput; 
      return asObejct;
    } else {
      console.log("[Server] Failed to fact check the statement");
      throw new Error("Failed to fact check the statement");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to reach Open AI");
  }

};