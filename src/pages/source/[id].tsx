/* eslint-disable @next/next/no-img-element */
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";  
import Link from "next/link"; 
import React from "react";

export default function Home() { 
  const [chosenMethod, setChosenMethod] = React.useState("auto");

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

 