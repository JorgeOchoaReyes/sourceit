import React from "react"; 
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ImageIcon, LightbulbIcon, TextIcon, YoutubeIcon } from "lucide-react";
import Link from "next/link";
import { AnimatedLoading } from "../loading/AnimatedLoading";

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
}

export const SearchView: React.FC<SearchViewProps> = ({
  sourceMutation,
  sourceText,
  setSourceText,
  chosenMethod,
  setChosenMethod,
  loading,
  setLoading,
  onClickMehod,
  onEnter,
}) => {
  return (
    <>
      <div className="flex flex-col items-center gap-8 max-w-xl w-full">
        <div className="w-24 h-24 relative">
          <img
            src="/sourceit_white.webp"
            alt="Logo" 
            className="w-full h-full rounded-3xl"
          />
        </div>
        <div className="w-full space-y-4">
          <div className="relative">
            {
              (loading || sourceMutation.isPending) ? 
                <div className="w-full h-10 flex items-center justify-center">  
                  <AnimatedLoading /> 
                </div>: 
                <Textarea
                  placeholder="paste here . . . ."
                  className="w-full bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400"
                  value={sourceText} 

                  onChange={(e) => setSourceText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") { 
                      await onEnter();
                    }
                  }}
                />
            }
          </div>
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className={`${chosenMethod === "auto" ? "opacity-100" : "opacity-50"} hover:opacity-100`} onClick={() => onClickMehod("auto")}>
                <span className="mr-2"><LightbulbIcon color="#f2c606" /> </span> auto
              </Button>
              <Button variant="ghost" size="sm" className={`${chosenMethod === "youtube" ? "opacity-100" : "opacity-50"} hover:opacity-100`} onClick={() => onClickMehod("youtube")}>
                <span className="mr-2"><YoutubeIcon color="red" /> </span> youtube
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
      <div className="text-xs text-zinc-500">
          by continuing, you agree to{" "}
        <Link href="#" className="underline hover:text-white">
            terms and ethics of use
        </Link>
      </div>
    </>
  );
};  