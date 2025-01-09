import { type SourceParagraph } from "../types";
import {v4 as uuid} from "uuid";

export const determineTypeOfContent = (raw: string) => {
  const isLink = raw.includes("http") || raw.includes("www");
  const isText = raw.split(" ").length > 10;
  const isAnyfile = raw.split(".").length > 1;
  let type = "text";
  switch (true) {
    case isLink:
      type = "link";
      break;
    case isText:
      type = "text";
      break;
    case isAnyfile:
      type = "file";
      break;
    default:
      type = "text";
  }
  return type;
};

export const convertTextToSourceParagraph = (text: string, sourceId: string) => {
  const paragraphs = text.split("\n").filter((p) => p.length > 0);
  return paragraphs.map((p, i) => {
    return {
      id: uuid(),
      sourceText: p,
      sourceId: sourceId,
      generatedBy: "chatgt",
      factCheck: {
        validity: "unknown",
        reason: "unknown",
        sources: [],
      },
      upvote: 0,
      downvote: 0,
      indexInContext: i,
    } as SourceParagraph;
  });
};

export const convertTranscribeToSourceParagraph = (
  transcription: {
    text: string,
    speakerTag: number,
    time: string,
  }[],
  sourceId: string
) => {
  return transcription.map((t, i) => {
    return {
      id: uuid(),
      sourceText: t.text,
      sourceId: sourceId,
      generatedBy: "chatgt",
      factCheck: {
        validity: "unknown",
        reason: "unknown",
        sources: [],
      },
      upvote: 0,
      downvote: 0,
      indexInContext: i,
      speaker: t.speakerTag.toString(),
    } as SourceParagraph;
  });
};