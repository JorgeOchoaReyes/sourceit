import {Storage} from "@google-cloud/storage"; 
import OpenAI from "openai";   
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { type SourceParagraph, type StrucutredOutput } from "~/types";
import vision from "@google-cloud/vision"; 
import { v1p1beta1 } from "@google-cloud/speech";  
import { v4 as uuid } from "uuid"; 
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph"; 
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
 

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
    const pathOfImage = `gs://${gcpPathImage}/${imageName}`;
    return pathOfImage;
  } catch (error) { 
    console.log("Failed", (error));
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

export const uploadAudioToStorage = async (audioFile: Buffer, fileName: string) => {
  const credentials = getGcpClientCredentials();
  const gcp_storage = new Storage({
    projectId: credentials.project_id,
    credentials: credentials,
  }); 
  const bucket = gcp_storage.bucket(gcpPathAudio);
  const file = bucket.file(fileName);
  const writeStream = file.createWriteStream(); 
  const readableAudio = Readable.from(audioFile);
  await pipeline(readableAudio, writeStream); 
  return `gs://${gcpPathAudio}/${fileName}`;
};
 
export const transcribeAudio = async (path: string) => {  
  try {
    const credentials = getGcpClientCredentials();
    const client = new SpeechClient({
      projectId: credentials.project_id,
      credentials: credentials,
    });  
    const responseLong = await client.longRunningRecognize({
      audio: { uri: path },
      config: {
        encoding: "MP3",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        enableSpeakerDiarization: true,
      },
    }); 
    const response = await responseLong[0].promise(); 
    if(response[0]?.results?.length === 0) {
      throw new Error("Failed to transcribe audio");
    } 
    const transcriptionFull = response[0]?.results?.map(result => result?.alternatives?.[0]?.transcript)?.join("\n"); 
    return transcriptionFull;
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
            "{\"validity\": \"true/false/unknown\", \"fallacies\": \"reasoning text\", \"reason\": \"reasoning text\", \"sources\": [\"source1\", \"source2\"]}." +
            "For example, {\"validity\": \"true\", \"fallacies\": \"The speaker use the following fallacies because...\", \"reason\": \"The statement is true because...\", \"sources\": [\"source1\", \"source2\"]}" + 
            "If you are unable to fact-check the statement, please respond with {\"validity\": \"unavailble\", \"fallacies\": \"\", \"reason\": \"reason for not being able to fact-check\", \"sources\": []}" +
            "Ensure that the sources are valid URLs and the sources are valid as well, do not provide links that are invalid." + 
            "Do the best you can to provide accurate information and understand what the user is saying.",
        },
        { role: "user", content: `Fact-check this statement: "${raw}"` },
      ], 
    });
    const result = response.choices[0]?.message.content;   
    if(result && result.trim() !== "") {
      const asObejct = JSON.parse(result) as StrucutredOutput; 
      return asObejct;
    } else { 
      throw new Error("Failed to fact check the statement");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to reach Open AI");
  } 
};

export const convertTextToSourceParagraph = (text: string, sourceId: string) => {
  const paragraphs = text.split("\n").filter((p) => p.length > 0);
  return paragraphs.map((p, i) => {
    return {
      id: uuid(),
      sourceText: p,
      sourceId: sourceId,
      generatedBy: "chatgt",
      factCheck: {
        validity: "unknown",
        reason: "unknown",
        sources: [],
      },
      upvote: 0,
      downvote: 0,
      indexInContext: i,
    } as SourceParagraph;
  });
};


export const factCheckerParagraphv2 = async (raw: string) => {
  const tools = [new TavilySearchResults({maxResults: 3, apiKey: process.env.tavilyApi})];
  const toolNode = new ToolNode(tools);

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    apiKey: process.env.OPENAPI_KEY,
  });

  const shouldContinue = ({messages}: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1];
    if(lastMessage?.additional_kwargs.tool_calls) {
      return "tools"; 
    }
    return "__end__"; 
  };

  const  callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages); 
    return { 
      messages: [response]
    };
  };

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue); 

  const app = workflow.compile(); 
  const  finalState = await app.invoke({
    messages: [new HumanMessage(
      `Fact-check this statement: "${raw}"`
    )]
  });

  console.log(finalState?.messages?.[finalState?.messages?.length - 1]?.content);

};
