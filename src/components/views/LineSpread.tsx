import React from "react"; 
import { useStore } from "~/hooks/use-store";
import { Button } from "../ui/button";
import { UndoIcon } from "lucide-react";
import { TextLoading } from "../loading/TextLoading";
import { FactCheckDrawer } from "../drawer/fact-check-drawer"; 

interface LinesSpreadProps {
    setSourceReady: (b: boolean) => void;
    textLoading: boolean;
}

export const LinesSpread: React.FC<LinesSpreadProps> = ({
  setSourceReady,
  textLoading
}) => {
  const {localSource, clearLocalSource} = useStore();
  const [chosenParagraph, setChosenParagraph] = React.useState(-1);
  const [factCheckDrawerOpen, setFactCheckDrawerOpen] = React.useState(false);
  return (
    <div className="flex flex-col items-start justify-start h-full mt-10 w-full p-4"> 
      {
        textLoading ? 
          <TextLoading />  
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
            <div className="flex flex-col items-start justify-center p-4 w-full">
              {
                localSource?.sourceLineItems.map((lineItem, index) => {
                  return (
                    <div
                      key={lineItem.id} 
                      className="flex flex-row items-center justify-between w-full py-2" 
                      onClick={()=>{
                        if(index === chosenParagraph) {
                          setChosenParagraph(-1);
                          setFactCheckDrawerOpen(false);
                          return;
                        }
                        setChosenParagraph(index);
                        setFactCheckDrawerOpen(true);
                      }} 
                    >
                      <div
                        className="flex flex-row items-center gap-2 w-9/12 hover:bg-slate-600 p-4 rounded-lg cursor-pointer transition-all transform"
                        style={{
                          backgroundColor: index === chosenParagraph ? "#2d3748" : ""
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-xs">
                          {index + 1}
                        </div>
                        <div className="text-md text-white w-full">
                          {lineItem.sourceText}
                        </div>
                      </div> 
                    </div>
                  );
                })
              }
            </div>
          </>
      }
      <FactCheckDrawer 
        open={factCheckDrawerOpen}
        onClose={() => setFactCheckDrawerOpen(false)}
      />
    </div>
  );
};