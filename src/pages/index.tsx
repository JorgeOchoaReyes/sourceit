/* eslint-disable @next/next/no-img-element */
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input"; 
import { ImageIcon, LightbulbIcon, TextIcon, YoutubeIcon } from "lucide-react";
import Link from "next/link"; 
import React from "react";
import { AnimatedLoading } from "~/components/loading/AnimatedLoading";

export default function Home() { 
  const [chosenMethod, setChosenMethod] = React.useState("auto");
  const [loading, setLoading] = React.useState(false);

  const onClickMehod = (method: string) => {
    setChosenMethod(method);
  };

  return (
    <Layout>
      <main className="flex-1 flex flex-col items-center justify-center p-4">

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
                loading ? 
                  <div className="w-full h-10 flex items-center justify-center">  
                    <AnimatedLoading /> 
                  </div>: 
                  <Input 
                    placeholder="paste here . . . ."
                    className="w-full bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                        }, 5000);
                      }
                    }}
                  />}
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
      </main>
    </Layout>
  );
}

 