-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."uploadedfiles" (
    "id" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploadedfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evaluationjobs" (
    "id" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'QUEUED',
    "jobDescription" TEXT NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cvFileId" TEXT NOT NULL,
    "projectReportFileId" TEXT NOT NULL,
    "studyCaseBriefId" TEXT NOT NULL,

    CONSTRAINT "evaluationjobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vectorembeddings" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vectorembeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploadedfiles_storagePath_key" ON "public"."uploadedfiles"("storagePath");

-- AddForeignKey
ALTER TABLE "public"."evaluationjobs" ADD CONSTRAINT "evaluationjobs_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "public"."uploadedfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluationjobs" ADD CONSTRAINT "evaluationjobs_projectReportFileId_fkey" FOREIGN KEY ("projectReportFileId") REFERENCES "public"."uploadedfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluationjobs" ADD CONSTRAINT "evaluationjobs_studyCaseBriefId_fkey" FOREIGN KEY ("studyCaseBriefId") REFERENCES "public"."uploadedfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
