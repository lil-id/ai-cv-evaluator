-- CreateTable
CREATE TABLE "public"."rubrics" (
    "id" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "evaluationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "scoringGuide" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embeddingId" TEXT NOT NULL,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rubrics_embeddingId_key" ON "public"."rubrics"("embeddingId");

-- AddForeignKey
ALTER TABLE "public"."rubrics" ADD CONSTRAINT "rubrics_embeddingId_fkey" FOREIGN KEY ("embeddingId") REFERENCES "public"."vectorembeddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
