import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { uploadAudioToStorage } from "~/server/functions";

export const sourceRouter = createTRPCRouter({
  source: publicProcedure
    .input(z.object({ url: z.string().min(1) }))
    .mutation(async ({ input }) => {
      console.log("Getting audio . . . . . ");  
      try {
        const path = await uploadAudioToStorage(input.url,); 
        console.log("Success!");
        return path;
      } catch (error) { 
        console.log(error);
        throw new Error("Failed to get audio");
      }
    }),
});
