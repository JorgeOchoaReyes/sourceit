export interface Source { 
    id: string; 
    title: string;
    sourceType: "auto" | "youtube" | "audio" | "image" | "text";
    source: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
    sourceLineItems: SourceLineItem[];
}

export interface SourceLineItem {
    id: string;
    text: string;
    sourceText: string;
    sourceId: string;
    generatedBy: "chatgt";
    links: string[];
    indexInContext: number; // This is just to ensure that we keep the order of the source
    speaker?: string;
}


