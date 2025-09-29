/*
  Warnings:

  - You are about to drop the `JobPosting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."JobPosting" DROP CONSTRAINT "JobPosting_descriptionEmbeddingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobPosting" DROP CONSTRAINT "JobPosting_studyCaseBriefFileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."evaluationjobs" DROP CONSTRAINT "evaluationjobs_jobPostingId_fkey";

-- DropTable
DROP TABLE "public"."JobPosting";

-- CreateTable
CREATE TABLE "public"."jobpostings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyCaseBriefFileId" TEXT NOT NULL,
    "descriptionEmbeddingId" TEXT NOT NULL,

    CONSTRAINT "jobpostings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."evaluationjobs" ADD CONSTRAINT "evaluationjobs_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "public"."jobpostings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobpostings" ADD CONSTRAINT "jobpostings_studyCaseBriefFileId_fkey" FOREIGN KEY ("studyCaseBriefFileId") REFERENCES "public"."uploadedfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobpostings" ADD CONSTRAINT "jobpostings_descriptionEmbeddingId_fkey" FOREIGN KEY ("descriptionEmbeddingId") REFERENCES "public"."vectorembeddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
