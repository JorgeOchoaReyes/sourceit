import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { type SourceParagraph } from "~/types";
import { TextLoading } from "../loading/TextLoading";
import {CheckCheckIcon, XCircleIcon, SignalLow} from "lucide-react";

interface FactCheckDrawerProps {
  open: boolean;
  onClose: () => void;
  sourceParagraph: SourceParagraph | null;
  loading: boolean;
}

export const FactCheckDrawer: React.FC<FactCheckDrawerProps> = ({
  open,
  onClose,
  sourceParagraph,
  loading,
}) => { 
  return (
    <Drawer open={open} onClose={onClose} >
      <DrawerContent 
        style={{
          userSelect: "auto"
        }}
        className="bg-neutral-900 text-white p-4 px-6"> 
        <p className="">Fact Check</p>
        {
          loading ? <TextLoading size="sm" /> : <>
            <div className="w-full flex flex-col items-center justify-center p-2">
              <div className="flex flex-col">
                {
                  !sourceParagraph ? 
                    <p> Noe Info . . . . </p>
                    :
                    <>
                      <p className="text-sm italic p-2 w-10/12">  
                        <q>{sourceParagraph.sourceText}</q>
                      </p>
                      <hr className="w-11/12 my-4" />  
                      <div className="w-10/12">
                        <div className="text-lg p-2 flex flex-row items-center " > 
                          • <u>  Validity </u>: 
                          <div
                            className="flex flex-row items-center justify-center ml-2"
                            style={{ 
                              backgroundColor: sourceParagraph.factCheck.validity === "true" ? "#00FF00" : "#ff0000",
                              borderRadius: "8px",
                              width: "fit-content",
                              color: "black",
                              fontWeight: "bold",
                              padding: 4
                            }}
                          >{
                              sourceParagraph.factCheck.validity === "true" ? <CheckCheckIcon /> : <XCircleIcon />
                            }{sourceParagraph.factCheck.validity === "true" ? "True" : "False"}</div>
                        </div>
                        <p className="text-lg p-2 "> 
                          •  <u> Explanation</u>: {sourceParagraph.factCheck.reason} 
                        </p>
                        <div className="flex flex-col items-start justify-start p-4">
                          <p className="text-lg font-bold"> 
                          • <u>  Sources</u>
                          </p>
                          <div className="flex flex-col items-start justify-start">
                            {
                              sourceParagraph.factCheck.sources.map((source, index) => (
                                <Button variant={"link"} className="ml-4 text-whtie" key={index} > 
                             • <a href={source} rel="noopener noreferrer" target="Pblank"> {source} </a>
                                </Button>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </> 
                }
              </div>
            </div> 
          </>
        }
        <DrawerFooter> 
          <DrawerClose>
            <Button >Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};