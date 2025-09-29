/*
  Warnings:

  - You are about to drop the column `studyCaseBriefId` on the `evaluationjobs` table. All the data in the column will be lost.
  - Added the required column `jobPostingId` to the `evaluationjobs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."evaluationjobs" DROP CONSTRAINT "evaluationjobs_studyCaseBriefId_fkey";

-- AlterTable
ALTER TABLE "public"."evaluationjobs" DROP COLUMN "studyCaseBriefId",
ADD COLUMN     "jobPostingId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyCaseBriefFileId" TEXT NOT NULL,
    "descriptionEmbeddingId" TEXT NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."evaluationjobs" ADD CONSTRAINT "evaluationjobs_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "public"."JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPosting" ADD CONSTRAINT "JobPosting_studyCaseBriefFileId_fkey" FOREIGN KEY ("studyCaseBriefFileId") REFERENCES "public"."uploadedfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPosting" ADD CONSTRAINT "JobPosting_descriptionEmbeddingId_fkey" FOREIGN KEY ("descriptionEmbeddingId") REFERENCES "public"."vectorembeddings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
