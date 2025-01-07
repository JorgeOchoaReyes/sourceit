import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"; 
import { uploadAudioToStorage, factCheckerParagraphv1, uploadImageToStorage, extractTextFromImage } from "~/server/functions"; 
import { v4 as uuid } from "uuid";

export const sourceRouter = createTRPCRouter({
  source: publicProcedure
    .input(z.object({ raw: z.string(), type: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Fact checking . . . . . ");  
      try { 
        console.log("Success!"); 
        if (input.type === "text") {
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
  textFromImage: publicProcedure
    .input(z.object({ dataUri: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Getting image . . . . . ");
      try { 
        const id = uuid(); 
        console.log("Uploading image to storage . . . . . ");
        const newFilePath = await uploadImageToStorage(input.dataUri, id); 
        if(!newFilePath) {
          return "failed";
        }
        const extractedText = await extractTextFromImage(newFilePath);  
        return extractedText;
      } catch (error) {
        console.log(error);
        return "failed";
      }
    }),
  testUpload: publicProcedure 
    .mutation(async () => {
      console.log("Getting image . . . . . ");
      try {  
 
      } catch (error) {
        console.log(error);
        return "failed";
      }
    }),
});
