import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { uploadAudioToStorage, factCheckerParagraphv1 } from "~/server/functions"; 

export const sourceRouter = createTRPCRouter({
  source: publicProcedure
    .input(z.object({ raw: z.string(), type: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Getting audio . . . . . ");  
      try { 
        console.log("Success!");
        if (input.type === "audio") {
          return {
            validity: "unknown",
            reason: "unknown",
            sources: ["unknown"],
          };
        } else if (input.type === "link") {
          return {
            validity: "unknown",
            reason: "unknown",
            sources: ["unknown"],
          };
        } else if (input.type === "image") {
          return {
            validity: "unknown",
            reason: "unknown",
            sources: ["unknown"],
          };
        } else if (input.type === "text") {
          const source = await factCheckerParagraphv1(input.raw);
          return source;
        }
        return {
          validity: "unknown",
          reason: "unknown",
          sources: ["unknown"],
        };
      } catch (error) { 
        console.log(error);
        return {
          validity: "unknown",
          reason: "unknown",
          sources: ["unknown"],
        };
      }
    }),
});
