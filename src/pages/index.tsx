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
import { Button } from "~/components/ui/button";

export default function Home() { 
  const useRouer = router;
  const sourceMutation = api.source.source.useMutation();
  // const [sourceText, setSourceText] = React.useState("https://youtu.be/Tu6GFBRd5eQ?si=oSC1BLo_IsKH7vGD");
  const [sourceText, setSourceText] = React.useState("");
  const [chosenMethod, setChosenMethod] = React.useState("auto");
  const [loading, setLoading] = React.useState(false);
  const [sourceReady, setSourceReady] = React.useState(false);
  const {setLocalSource, localSource} = useStore();

  const onClickMehod = (method: string) => {
    setChosenMethod(method);
  };

  const onEnter = async () => {
    const type = determineTypeOfContent(sourceText);
    setSourceReady(true);
    if(type === "text" || type === "file") {
      await useRouer.replace("?source=custom-text");
    } else if(type === "link") {
      await useRouer.replace("?source=custom-link");
    } 
    const sourceId = uuid();
    const sourceLineItems = convertTextToSourceParagraph(sourceText, sourceId);
    const newSource = {
      id: sourceId,  
      title: "Custom Source",
      sourceType: type,
      source: sourceText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      sourceLineItems: sourceLineItems,      
    } as Source;
    setLocalSource(newSource);
  };

  useEffect(() => {
    if(localSource) { 
      (async () => await useRouer.replace("?source=custom-text"))();
      setSourceReady(true);
    }
  } , [localSource]);

  const testUploadMutation = api.source.testUpload.useMutation();

  return (
    <Layout>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Button onClick={async () => {
          await testUploadMutation.mutateAsync();
        }}>
          TEST
        </Button>
        {
          sourceReady ? 
            <LinesSpread 
              textLoading={loading}  
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
            />
        } 
      </main>
    </Layout>
  );
}

 