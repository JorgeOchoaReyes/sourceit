import React from "react";
import {
  Drawer, 
  DrawerContent, 
} from "../ui/drawer";
import { Button } from "../ui/button";
import { type SourceParagraph } from "~/types";
import { TextLoading } from "../loading/TextLoading";
import {CheckCheckIcon, XCircleIcon, OctagonMinusIcon } from "lucide-react";
import { AITag } from "../tags/AITag";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { motion } from "framer-motion";

interface FactCheckDrawerProps {
  open: boolean;
  onClose: () => void;
  sourceParagraph: SourceParagraph | null;
  loading: boolean;
  refactCheck: () => Promise<void>;
  chosenModel: string;
  setChosenModel: (model: string) => void;
}

export const FactCheckDrawer: React.FC<FactCheckDrawerProps> = ({
  open,
  onClose,
  sourceParagraph,
  loading,
  refactCheck,
  chosenModel, 
  setChosenModel
}) => { 
  return (
    <Drawer open={open} onClose={onClose}  >
      <DrawerContent 
        style={{
          userSelect: "auto"
        }}
        className="bg-neutral-900 text-white p-4 px-6"> 
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center justify-start mb-5">  
            <AITag />  
          </div>
          <div className="flex flex-col-reverse items-center justify-center">
            <Select value={chosenModel} onValueChange={(e) => {
              setChosenModel(e);
            }}>
              <SelectTrigger className="md:w-full xs:w-36 xs:text-xs  text-black">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-black">Models  </SelectLabel>  
                  <SelectItem defaultChecked value="ChatGpt (GPT-4)">ChatGpt (GPT-4)</SelectItem>
                  <SelectItem defaultChecked value="ReAct Agent w/GPT-4o-mini">ReAct Agent w/GPT-4o-mini</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div> 
              <Button
                onClick={async () => { 
                  await refactCheck();
                }} > Re-Fact Check </Button>
            </div>
          </div>
        </div>
        {
          loading ? <TextLoading size="sm" /> : <>
            <div className="w-full flex flex-col md:items-center md:justify-center xs:overflow-scroll xs:max-h-64">
              <div className="flex flex-col">
                {
                  !sourceParagraph ? 
                    <p> No Info . . . . </p>
                    :
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-start justify-start p-4 w-full max-w-[100vw]"
                    >
                      <p className="md:text-sm xs:text-xs italic md:p-2 sx:m-1 xs:w-full md:w-10/12">  
                        <q>{sourceParagraph.sourceText}</q>
                      </p>
                      <hr className="w-12/12 my-4" />  
                      <div className="w-10/12">
                        <div className="md:text-lg xs:text-xs p-2 flex flex-row items-center " > 
                          • <u>  Validity </u>: 
                          <div
                            className="flex flex-row items-center justify-center ml-5"
                            style={{ 
                              backgroundColor: sourceParagraph.factCheck.validity === "true" ? "#00FF00" :
                                sourceParagraph.factCheck.validity === "unknown" ? "#f1a637" : "#ff0000",
                              borderRadius: "8px",
                              width: "fit-content",
                              color: sourceParagraph.factCheck.validity === "true" ? "black" : "white",
                              fontWeight: "bold",
                              padding: 6
                            }}
                          >{
                              sourceParagraph.factCheck.validity === "true" ? <CheckCheckIcon /> :
                                sourceParagraph.factCheck.validity === "unknown" ? <OctagonMinusIcon className="mr-1"  /> 
                                  : <XCircleIcon className="mr-1" /> 
                            }{sourceParagraph.factCheck.validity === "true" ? "True" : sourceParagraph.factCheck.validity === "unknown" ? "Unknown" : "False"}</div>
                        </div>
                        <p className="md:text-lg xs:text-xs p-2 "> 
                          •  <u> Explanation</u>: {sourceParagraph.factCheck.reason} 
                        </p>
                        <p className="md:text-lg xs:text-xs p-2 "> 
                          •  <u> Fallacies</u>: {sourceParagraph.factCheck.fallacies} 
                        </p>
                        <div className="flex flex-col items-start justify-start p-2">
                          <p className="md:text-lg xs:text-xs font-bold"> 
                          • <u>  Sources</u>
                          </p>
                          <div className="flex flex-col items-start justify-start flex-wrap xs:w-full">
                            {
                              sourceParagraph.factCheck.sources.map((source, index) => (
                                <Button variant={"link"} className="md:ml-4 xs:ml-1 text-white text-wrap xs:text-xs text-start xs:my-5" key={index} > 
                                • <a href={source} rel="noopener noreferrer" target="_blank"> {source} </a>
                                </Button>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div> 
                }
              </div>
            </div> 
          </>
        } 
      </DrawerContent>
    </Drawer>
  );
};