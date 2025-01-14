/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
import { Layout } from "~/components/layout"; 
import React, { useEffect } from "react"; 
import { api } from "~/utils/api"; 
import { SearchView } from "~/components/views/searchVIew";
import router from "next/router";
import { determineTypeOfContent, convertTextToSourceParagraph } from "~/utils/functions";
import { type Source } from "~/types";
import {v4 as uuid} from "uuid";
import { useStore } from "~/hooks/use-store";
import { LinesSpread } from "~/components/views/LineSpread"; 

export default function Home() {  
  const {setLocalSource, localSource} = useStore();
  const sourceMutation = api.source.source.useMutation();
  const textFromImageMutation = api.source.textFromImage.useMutation(); 
  const textFromPdf = api.source.textFromPdf.useMutation();
  const [sourceText, setSourceText] = React.useState("");
  const [chosenMethod, setChosenMethod] = React.useState("auto");
  const [loading, setLoading] = React.useState(false);
  const [sourceReady, setSourceReady] = React.useState(false); 

  const onClickMehod = (method: string) => {
    setChosenMethod(method);
  };

  const onEnter = async (fileToProcess?: (File | null)) => {
    const type = determineTypeOfContent(sourceText);
    setSourceReady(true);
    if(type === "text" || type === "file") { 
      let textToUse = sourceText;
      if(fileToProcess) {
        const typeOfFile = fileToProcess.type.split("/")[0];  
        if(typeOfFile === "image") {
          const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const dataUri = await fileToDataUri(fileToProcess);
          const text = await textFromImageMutation.mutateAsync({dataUri});
          textToUse = text; 
        }
        else if(typeOfFile === "audio") {
          const formDataAudio = new FormData();
          formDataAudio.append("audio", fileToProcess); 
          setLoading((prev) => {
            prev = true;
            return prev; 
          });
          const fetchFromAudioApi = fetch("/api/audio", {
            method: "POST",
            body: formDataAudio, 
          });
          const response = await fetchFromAudioApi;
          const text = await response.json() as {message: string, error: string};
          if(text.error !== "") {
            alert("Unable to transcribe audio");
            setLoading((prev) => {
              prev = false;
              return prev;
            });
            setSourceReady(false);
            return;
          }
          textToUse = text.message ?? "Unable to transcribe audio";
          setLoading((prev) => {
            prev = false;
            return prev; 
          }); 
        } 
        else if(typeOfFile === "video") {
          alert("Video not supported yet");
          setSourceReady(false);
          return; 
        }
        else if(typeOfFile === "text") {
          const text = await new Promise<string>((resolve) => {
            const reader = new FileReader(); 
            reader.onload = (e) => {
              const text = e.target?.result as string; 
              resolve(text);
            };
            reader.readAsText(fileToProcess); 
          });
          textToUse = text;
        }
        else if(typeOfFile === "application") {  
          const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }); 
          const dataUri = await fileToDataUri(fileToProcess);
          const extractedText = await textFromPdf.mutateAsync({dataUri});
          textToUse = extractedText;
        }
      } 
      const sourceId = uuid();
      const sourceLineItems = convertTextToSourceParagraph(textToUse, sourceId);
      const newSource = {
        id: sourceId,  
        title: "Source.it",
        sourceType: type,
        source: textToUse,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        sourceLineItems: sourceLineItems,      
      } as Source;
      setLocalSource(newSource);
    } 
    else if(type === "link") {
      alert("YT link not supported yet");
      setSourceReady(false);
      return; 
    }  
  }; 

  useEffect(() => {
    if(localSource) {
      setSourceReady(true);
    }
  }, [localSource]);

  return (
    <Layout>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {
          sourceReady ? 
            <LinesSpread 
              textLoading={loading || textFromImageMutation.isPending || textFromPdf.isPending}  
              setSourceReady={setSourceReady}
              typeOfSource={chosenMethod === "auto" ? determineTypeOfContent(sourceText) : chosenMethod}
            />
            :
            <SearchView 
              setSourceText={setSourceText}
              sourceText={sourceText}
              sourceMutation={sourceMutation}
              chosenMethod={chosenMethod}
              setChosenMethod={setChosenMethod}
              loading={loading}
              setLoading={setLoading}
              onClickMehod={onClickMehod}
              onEnter={onEnter} 
              setFile={(f) => { 
                onEnter(f);
              }}
            />
        } 
      </main>
    </Layout>
  );
}

 