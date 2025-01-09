import youtubeStream from "yt-stream"; 
import {Storage} from "@google-cloud/storage"; 
import OpenAI from "openai";   
import { pipeline } from "stream/promises";
import { type Readable } from "stream";
import { type StrucutredOutput } from "~/types";
import vision from "@google-cloud/vision"; 
import { v1p1beta1 } from "@google-cloud/speech";  

const { SpeechClient } = v1p1beta1;

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

const gcpPathAudio = "audio-1-transcribe";
const gcpPathImage = "image-1-text"; 
const encodedGcp = process.env.gcpEncoded ?? "";

const getGcpClientCredentials = () => { 
  const decodedServiceAccount = Buffer.from(encodedGcp, "base64").toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount) as {project_id: string, private_key: string, client_email: string};
  return credentials;
};

export const uploadImageToStorage = async (dataUri: string, imageName: string) => {
  const credentials = getGcpClientCredentials();
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
  const credentials = getGcpClientCredentials();
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

export const getYoutubeDetails = async (url: string): Promise<{ id:string, title: string }> => {
  youtubeStream.setApiKey(process.env.YOUTUBE_API_KEY ?? ""); 
  youtubeStream.setPreference("api");  
  const name = await youtubeStream.getInfo(url);
  return{
    id: name.id,
    title: name.title,
  };
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
      download: true,
    }); 
    return audioStream.stream;
  } catch (error) {
    console.log(error); 
    throw new Error("Failed to upload audio to storage");
  }
}; 

export const uploadYtToBucket = async (readable: Readable, fileName: string) => {
  const credentials = getGcpClientCredentials();
  const gcp_storage = new Storage({
    projectId: credentials.project_id,
    credentials: credentials,
  });  
  console.log("Accessing storage  . . . . . ");
  const bucket = gcp_storage.bucket(gcpPathAudio);
  const file = bucket.file(fileName);
  const writeStream = file.createWriteStream();
  await pipeline(readable, writeStream);
  console.log("Successfully uploaded audio to storage . . . . . ");
  return `gs://${gcpPathAudio}/${fileName}`;
}; 
 
export const transcribeAudio = async (path: string) => { 
  console.log("Transcribing audio . . . . . ");
  const credentials = getGcpClientCredentials();
  try {
    const client = new SpeechClient({
      projectId: credentials.project_id,
      credentials: credentials,
    }); 
    const response = await client.recognize({
      audio: { uri: path },
      config: {
        encoding: "MP3",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        enableSpeakerDiarization: true,
      },
    });
    if(response[0]?.results?.length === 0) {
      throw new Error("Failed to transcribe audio");
    }
    const transcription = [] as {
      text: string,
      speakerTag: number,
      time: string,
    }[];
    const data = response[0].results; 
    const lastElement = data?.[data?.length - 1];  
    const alternative = lastElement?.alternatives;
    alternative?.forEach((alt) => { 
      const words = alt.words;
      const breakdown = {} as Record<string, Record<string, string>>;
      words?.forEach((word,) => { 
        const speakerWord = word.word ?? "";
        const speakerTag = word.speakerTag?.toString() ?? "0";
        const time = word.startTime?.seconds?.toString() ?? ""; 
        if (breakdown[time]) {
          if(breakdown[time][speakerTag]) {
            const current = breakdown[time][speakerTag];
            breakdown[time] = { 
              ...breakdown[time],
              [speakerTag]: current + " " + speakerWord,
            };
          } else { 
            breakdown[time] = { 
              ...breakdown[time],
              [speakerTag]: speakerWord,
            };
          }
        } else { 
          breakdown[time] = { 
            [speakerTag]: speakerWord,
          };
        }
      }); 
      Object.keys(breakdown).sort().forEach((time) => { 
        const speakers = breakdown[time];
        Object.keys(speakers ?? {}).forEach((speaker) => { 
          const prevTranscription = transcription?.[transcription?.length - 1] ?? null;
          const prevSpeaker = prevTranscription?.speakerTag ?? 0; 
          const currentspeaker = parseInt(speaker);
          if (prevSpeaker === currentspeaker) {
            const prevText = prevTranscription?.text ?? "";
            const currentText = speakers?.[speaker] ?? "";
            const newText = prevText + " " + currentText;
            transcription[transcription?.length - 1] = {
              text: newText,
              speakerTag: currentspeaker,
              time: time,
            };
          } else {
            transcription.push({
              text: speakers?.[speaker] ?? "",
              speakerTag: currentspeaker,
              time: time,
            });
          }
        });
      });
    });  
    return transcription.sort((a, b) => {
      return parseInt(a.time) - parseInt(b.time);
    }); 
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to transcribe audio");
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
            "{\"validity\": \"true/false/unknown\", \"reason\": \"reasoning text\", \"sources\": [\"source1\", \"source2\"]}." +
            "For example, {\"validity\": \"true\", \"reason\": \"The statement is true because...\", \"sources\": [\"source1\", \"source2\"]}" + 
            "If you are unable to fact-check the statement, please respond with {\"validity\": \"unavailble\", \"reason\": \"unavailble\", \"sources\": [\"unavailble\"]}" +
            "Ensure that the sources are valid URLs.",
        },
        { role: "user", content: `Fact-check this statement: "${raw}"` },
      ], 
    });
    const result = response.choices[0]?.message.content; 
    console.log(result);
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