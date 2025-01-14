import React from "react"; 
import { useStore } from "~/hooks/use-store";
import { Button } from "../ui/button";
import { UndoIcon } from "lucide-react";
import { TextLoading } from "../loading/TextLoading";
import { FactCheckDrawer } from "../drawer/fact-check-drawer"; 
import { api } from "~/utils/api"; 
import { motion } from "framer-motion";

interface LinesSpreadProps {
  setSourceReady: (b: boolean) => void;
  textLoading: boolean;
  typeOfSource: string;
}

export const LinesSpread: React.FC<LinesSpreadProps> = ({
  setSourceReady,
  textLoading,
  typeOfSource
}) => {
  const {localSource, clearLocalSource, setLocalSource} = useStore();
  const [chosenParagraph, setChosenParagraph] = React.useState(-1);
  const [factCheckDrawerOpen, setFactCheckDrawerOpen] = React.useState(false);
  const [chosenModel, setChosenModel] = React.useState("ChatGpt (GPT-4)");

  const sourceMutation = api.source.source.useMutation();

  const onClickFactCheck = async (paragraph: number, retry?: boolean) => {
    const foundParagraph = localSource?.sourceLineItems[paragraph];  
    if(!foundParagraph) {
      alert("No Paragraph found!");
      return; 
    } 
    if(
      foundParagraph?.factCheck?.validity !== "unknown" && 
      foundParagraph?.factCheck.reason  !== "unknown" && 
      foundParagraph?.factCheck.sources[0] !== "unknown" &&
      !retry
    ) { 
      return;
    } 
    const factCheckedParagraph = await sourceMutation.mutateAsync({
      raw: foundParagraph?.sourceText ?? "",
      model: chosenModel
    });    
    if(factCheckedParagraph && factCheckedParagraph.reason !== "unknown") { 
      const newSource = {...localSource};
      foundParagraph.factCheck = factCheckedParagraph;
      newSource.sourceLineItems[paragraph] = foundParagraph;
      setLocalSource(newSource);
    } else {
      alert("Failed to fact check, please try again.");
    } 
  };

  return (
    <div className="flex flex-col items-start justify-start h-full mt-10 w-full md:p-4"> 
      {
        textLoading ? 
          <TextLoading sourceType={typeOfSource} />  
          :
          <>
            <div className="flex flex-row items-center justify-between w-full mb-20"> 
              <p className="text-white text-3xl font-bold"> 
                {localSource?.title} 
              </p>
              <Button   
                variant={"outline"}  
                onClick={() => {
                  clearLocalSource();
                  setSourceReady(false);
                }}
                className="flex flex-row items-center gap-2 text-bold text-black"
              >
                <UndoIcon color="blue" size={64} /> Reset
              </Button>
            </div>
            <div className="flex flex-col items-start justify-center md:p-4 w-full max-w-[100vw]">
              {
                localSource?.sourceLineItems.map((lineItem, index) => {
                  return (
                    <motion.div
                      key={lineItem.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-row items-center justify-between w-full py-2 max-w-[100vw] flex-wrap" 
                      onClick={async () => {
                        if(index === chosenParagraph) {
                          setChosenParagraph(-1);
                          setFactCheckDrawerOpen(false);
                          return;
                        }
                        setChosenParagraph(index);
                        setFactCheckDrawerOpen(true);
                        await onClickFactCheck(index);
                      }} 
                    >
                      <div
                        className="flex flex-row items-center gap-2 xs:w-full md:w-9/12 hover:bg-slate-600 md:p-4 xs:p-2 rounded-lg cursor-pointer transition-all transform"
                        style={{
                          backgroundColor: index === chosenParagraph ? "#2d3748" : ""
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-xs">
                          {index + 1}
                        </div>
                        <div className="xs:text-xs md:text-md text-white flex flex-wrap w-full">
                          {lineItem.sourceText}  
                        </div>
                      </div> 
                    </motion.div>
                  );
                })
              }
            </div>
          </>
      }
      <FactCheckDrawer 
        open={factCheckDrawerOpen}
        onClose={() => setFactCheckDrawerOpen(false)}
        sourceParagraph={localSource?.sourceLineItems[chosenParagraph] ?? null}
        loading={sourceMutation.isPending}
        refactCheck={async () => {
          await onClickFactCheck(chosenParagraph, true);
        }}
        chosenModel={chosenModel}
        setChosenModel={setChosenModel}
      />
    </div>
  );
};