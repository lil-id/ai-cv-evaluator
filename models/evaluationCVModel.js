import prisma from "../helpers/db/prisma.js";
import { evaluationQueue } from "../queues/evaluation.js";

export const createAndQueueJob = async (jobData) => {
    const { jobId, cvFileId, projectReportFileId } = jobData;

    // Langkah 1: Simpan pekerjaan ke database terlebih dahulu
    const newEvaluationJob = await prisma.evaluationJob.create({
        data: {
          jobPostingId: jobId,
          cvFileId: cvFileId,
          projectReportFileId: projectReportFileId,
          status: 'QUEUED',
        },
      });

    // Langkah 2: Setelah berhasil disimpan, tambahkan pekerjaan ke antrian
    await evaluationQueue.add(
        "process-evaluation",
        { jobId: newEvaluationJob.id },
        {
            attempts: 3, // Coba sebanyak 3 kali (1 kali + 2 kali coba ulang)
            backoff: {
                type: "exponential", // Jenis jeda waktu
                delay: 5000, // Jeda awal 5 detik sebelum coba ulang pertama
            },
        }
    );

    return newEvaluationJob;
};
