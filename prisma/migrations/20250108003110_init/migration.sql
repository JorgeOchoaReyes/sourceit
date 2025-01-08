-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceParagraph" (
    "id" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "factCheck" JSONB NOT NULL,
    "upvote" INTEGER NOT NULL,
    "indexInContext" INTEGER NOT NULL,
    "userFactCheck" JSONB,
    "speaker" TEXT,

    CONSTRAINT "SourceParagraph_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SourceParagraph" ADD CONSTRAINT "SourceParagraph_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
