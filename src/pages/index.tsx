import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input"; 
import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; 
import React from "react";

export default function Home() { 
  const [isMuted, setIsMuted] = React.useState(false);

  return (
    <Layout>
      <main className="flex-1 flex flex-col items-center justify-between p-4">
        <div className="w-full flex justify-end">
          <Button variant="ghost" className="text-xs opacity-50 hover:opacity-100">
            supported services
          </Button>
        </div>

        <div className="flex flex-col items-center gap-8 max-w-xl w-full">
          <div className="w-24 h-24 relative">
            <Image
              src="/placeholder.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="w-full space-y-4">
            <div className="relative">
              <Input 
                placeholder="paste the link here"
                className="w-full bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400"
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
                  <span className="mr-2">⚡</span> auto
                </Button>
                <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
                  <span className="mr-2">🎵</span> audio
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-50 hover:opacity-100"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 mr-2" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                  )}
                  mute
                </Button>
              </div>
              <Button variant="ghost" size="sm">
                📋 paste
              </Button>
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

 