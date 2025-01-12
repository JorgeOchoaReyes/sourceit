import React from "react"; 
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ImageIcon, LightbulbIcon, TextIcon, } from "lucide-react";
import Link from "next/link";
import { AnimatedLoading } from "../loading/AnimatedLoading";
import { Input } from "../ui/input";

interface SearchViewProps {
  sourceMutation: {isPending: boolean};
  sourceText: string;
  setSourceText: (s: string) => void;
  chosenMethod: string;
  setChosenMethod: (s: string) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
  onClickMehod: (type: string) => void;
  onEnter: () => Promise<void>; 
  setFile: (f: File | null) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  sourceMutation,
  sourceText,
  setSourceText,
  chosenMethod, 
  loading, 
  onClickMehod,
  onEnter, 
  setFile
}) => {
 
  return (
    <>
      <div className="flex flex-col items-center gap-8 xs:w-full md:w-[600px] p-4">
        <div className="w-24 h-24 relative">
          <img
            src="/sourceit_white.webp"
            alt="Logo" 
            className="w-full h-full rounded-3xl"
          />
        </div>
        <div className="w-full space-y-4 ">
          <div className="relative">
            {
              (loading || sourceMutation.isPending) ? 
                <div className="w-full h-10 flex items-center justify-center">  
                  <AnimatedLoading /> 
                </div>
                : 
                <div className="w-full space-y-4">
                  { 
                    (chosenMethod === "auto" || chosenMethod === "text") ?
                      <Textarea
                        placeholder="paste text to fact check here . . . ."
                        className="xs:w-full bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400"
                        value={sourceText}  
                        onChange={(e) => setSourceText(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter") { 
                            await onEnter();
                          }
                        }}
                      /> : null
                  }
                  {
                  
                    (chosenMethod === "auto" || chosenMethod === "audio" || chosenMethod === "image") ?
                      <Input 
                        type="file" 
                        className="cursor-pointer mt-1" 
                        accept=".png,.jpg,.jpeg,.mp3,.pdf,.txt"  
                        onChange={async (e) => {
                          setFile(e.target.files?.[0] ?? null);
                        }}
                      /> : null
                  }
                </div>
            }
          </div>
          <div className="flex items-center justify-between gap-1 flex-wrap w-full">
            <div className="flex items-center gap-1 flex-wrap">
              <Button variant="ghost" size="sm" className={`${chosenMethod === "auto" ? "opacity-100" : "opacity-50"} hover:opacity-100`} onClick={() => onClickMehod("auto")}>
                <span className="mr-2"><LightbulbIcon color="#f2c606" /> </span> auto
              </Button> 
              <Button variant="ghost" size="sm" className={`${chosenMethod === "audio" ? "opacity-100" : "opacity-50"} hover:opacity-100`} onClick={() => onClickMehod("audio")}>
                <span className="mr-2">🎵</span> audio
              </Button>             
              <Button variant="ghost" size="sm" className={`${chosenMethod === "image" ? "opacity-100" : "opacity-50"} hover:opacity-100`} onClick={() => onClickMehod("image")}>
                <span className="mr-2"> <ImageIcon color="purple" /> </span> image
              </Button>
              <Button variant="ghost" size="sm" className={`${chosenMethod === "text" ? "opacity-100" : "opacity-50"} hover:opacity-100`} onClick={() => onClickMehod("text")}>
                <span className="mr-2"> <TextIcon /> </span> text
              </Button> 
            </div> 
          </div>
        </div>
      </div> 
    </>
  );
};  