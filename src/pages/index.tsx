/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
import { Layout } from "~/components/layout"; 
import React, { useEffect } from "react"; 
import { api } from "~/utils/api"; 
import { SearchView } from "~/components/views/searchVIew";
import router from "next/router";
import { determineTypeOfContent, convertTextToSourceParagraph, convertTranscribeToSourceParagraph } from "~/utils/functions";
import { type Source } from "~/types";
import {v4 as uuid} from "uuid";
import { useStore } from "~/hooks/use-store";
import { LinesSpread } from "~/components/views/LineSpread";
import { Button } from "~/components/ui/button";

export default function Home() { 
  const useRouer = router;
  const {setLocalSource, localSource} = useStore();
  const sourceMutation = api.source.source.useMutation();
  const textFromImageMutation = api.source.textFromImage.useMutation();
  const ytTranscribe = api.source.transcribeYt.useMutation(); 
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
      await useRouer.replace("?source=custom-text");
      let textToUse = sourceText;
      if(fileToProcess) {
        const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const dataUri = await fileToDataUri(fileToProcess);
        const text = await textFromImageMutation.mutateAsync({dataUri});
        textToUse = text;
        const sourceId = uuid();
        const sourceLineItems = convertTextToSourceParagraph(textToUse, sourceId);
        const newSource = {
          id: sourceId,  
          title: "Custom Source",
          sourceType: type,
          source: textToUse,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          sourceLineItems: sourceLineItems,      
        } as Source;
        setLocalSource(newSource);
      } 
    } 
    else if(type === "link") {
      await useRouer.replace("?source=custom-link");
      const transcribeResults = await ytTranscribe.mutateAsync({
        ytLink: sourceText.trim(),
      });
      if(transcribeResults === "failed") {
        alert("Failed to transcribe youtube video");
        return;
      }  
      setLocalSource(transcribeResults.source);
      return;
    }  
  };

  useEffect(() => {
    if(localSource) { 
      (async () => await useRouer.replace("?source-custom-text"))();
      setSourceReady(true);
    }
  } , [localSource]); 

  return (
    <Layout>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {
          sourceReady ? 
            <LinesSpread 
              textLoading={loading || textFromImageMutation.isPending || ytTranscribe.isPending}  
              setSourceReady={setSourceReady}
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

 