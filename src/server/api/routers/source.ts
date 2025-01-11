/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"; 
import { 
  factCheckerParagraphv1, 
  uploadImageToStorage, 
  extractTextFromImage,  
} from "~/server/functions"; 
import { v4 as uuid } from "uuid"; 
import pdf from "pdf-parse";

export const sourceRouter = createTRPCRouter({
  source: publicProcedure
    .input(z.object({ raw: z.string(), type: z.string() }))
    .mutation(async ({ input }) => { 
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
      try { 
        const id = uuid();  
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
  textFromPdf: publicProcedure
    .input(z.object({ dataUri: z.string() }))
    .mutation(async ({ input }) => { 
      try { 
        const attachmentContent = input.dataUri;
        const base64String = attachmentContent.split(",")[1];
        const asBuffer = Buffer.from(base64String ?? "", "base64");  
        const pdfData = await pdf(asBuffer);
        const text = pdfData.text; 
        return text;
      } catch (error) {
        console.log(error);
        return "failed";
      }
    }),
});
