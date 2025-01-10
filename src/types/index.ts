export interface Source { 
    id: string; 
    title: string;
    sourceType: "auto" | "link" | "audio" | "image" | "text";
    source: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt?: string;
    sourceLineItems: SourceParagraph[];
}

export interface SourceParagraph {
    id: string; 
    sourceText: string;
    sourceId: string;
    generatedBy: "chatgt";
    factCheck: StrucutredOutput;
    upvote: number;
    indexInContext: number; // This is just to ensure that we keep the order of the source
    userFactCheck?: StrucutredOutput;
    speaker?: string;
}

export interface StrucutredOutput {
    validity: string, 
    reason: string, 
    sources: string[],
    fallacies?: string,
}