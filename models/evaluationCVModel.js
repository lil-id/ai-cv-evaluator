import prisma from "../helpers/db/prisma.js";
import { evaluationQueue } from '../queues/evaluation.js';

export const createAndQueueJob = async (jobData) => {
  const { cvFileId, projectReportFileId, studyCaseBriefId, jobDescription } = jobData;

  // Langkah 1: Simpan pekerjaan ke database terlebih dahulu
  const newJob = await prisma.evaluationJob.create({
    data: {
      cvFileId: cvFileId,
      projectReportFileId: projectReportFileId,
      studyCaseBriefId: studyCaseBriefId,
      jobDescription: jobDescription,
      status: 'QUEUED', // Status awal saat dibuat
    },
  });

  // Langkah 2: Setelah berhasil disimpan, tambahkan pekerjaan ke antrian
  await evaluationQueue.add('process-evaluation', { jobId: newJob.id });

  return newJob;
};