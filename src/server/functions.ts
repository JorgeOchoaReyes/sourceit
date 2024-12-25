import youtubeStream from "yt-stream"; 
import {Storage} from "@google-cloud/storage"; 
import OpenAI from "openai";   
import { pipeline } from "stream/promises";
import { type Readable } from "stream";

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

const gcpPath = "audio-1-transcribe";
const serviceAccount = {
  type: process.env.type,  
  project_id: process.env.project_id, 
  private_key_id: process.env.private_key_id,  
  private_key: process.env.private_key,  
  client_email: process.env.client_email, 
  client_id: process.env.client_id, 
  auth_uri: process.env.auth_uri,  
  token_uri: process.env.token_uri,  
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url, 
  universe_domain: process.env.universe_domain, 
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

    const gcp_storage = new Storage(
      {
        projectId: serviceAccount.project_id,
        credentials: serviceAccount,
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

