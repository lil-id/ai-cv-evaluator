import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { createAndQueueJob } from "../models/evaluationCVModel.js";

const evaluateCVController = Router();

evaluateCVController.post("/evaluate", async (req, res) => {
    try {
        // 1. Validasi Input
        const {
            cvFileId,
            projectReportFileId,
            studyCaseBriefId,
            jobDescription,
        } = req.body;
        if (
            !cvFileId ||
            !projectReportFileId ||
            !studyCaseBriefId ||
            !jobDescription
        ) {
            return res.status(400).json({
                message:
                    "Missing required fields: cvFileId, projectReportFileId, studyCaseBriefId, jobDescription",
            });
        }

        // 2. Delegasi ke Service Layer untuk membuat dan mengantrikan pekerjaan
        const newJob = await createAndQueueJob(req.body);

        // 3. Mengirim Respons Segera (Asynchronous Acknowledgement)
        // Sesuai dokumen, kita harus segera merespons dengan ID dan status queued.
        res.status(202).json({
            id: newJob.id,
            status: "queued", // [cite: 32]
        });
    } catch (error) {
        logger.error("Evaluation Request Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default evaluateCVController;