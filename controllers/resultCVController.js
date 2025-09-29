import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { findJobById } from "../models/resultCVModel.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const resultCVController = Router();

resultCVController.get("/result/:id", isAuthenticated, async (req, res) => {
    try {
        // 1. Ambil ID dari parameter URL
        const { id } = req.params;

        // 2. Delegasi ke Service Layer untuk mengambil data pekerjaan
        const job = await findJobById(id);

        // 3. Handle kasus jika pekerjaan tidak ditemukan
        if (!job) {
            return res
                .status(404)
                .json({ message: "Evaluation job not found." });
        }

        // 4. Format respons berdasarkan status pekerjaan
        // Ini adalah implementasi langsung dari contoh output di dokumen brief.
        if (job.status === "COMPLETED") {
            res.status(200).json({
                id: job.id,
                status: job.status.toLowerCase(),
                result: job.result,
            });
        } else if (job.status === "FAILED") {
            res.status(200).json({
                id: job.id,
                status: job.status.toLowerCase(),
                message: "The evaluation process failed. Please try again.",
            });
        } else {
            // Untuk status QUEUED atau PROCESSING
            res.status(200).json({
                id: job.id,
                status: job.status.toLowerCase(),
            });
        }
    } catch (error) {
        logger.error("Get Result Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default resultCVController;
