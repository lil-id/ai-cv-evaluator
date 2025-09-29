import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { upload } from "../utils/file/fileUtility.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createJobPosting, getJobPostingById } from "../models/jobModel.js"; 

const jobController = Router();

jobController.get("/:jobId", isAuthenticated, async (req, res) => {
    try {
        const { jobId } = req.params;
        const jobPosting = await getJobPostingById(jobId);

        if (!jobPosting) {
            return res.status(404).json({ message: "Job posting not found." });
        }

        res.status(200).json({ jobPosting });
    } catch (error) {
        logger.error("Get Job Posting Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

jobController.post("/upload", isAuthenticated, upload.single("studyCaseBrief"), async (req, res) => {
    try {
        const { jobTitle, jobDescriptionText } = req.body;
        const studyCaseBriefFile = req.file;

        if (!jobTitle || !jobDescriptionText || !studyCaseBriefFile) {
            return res
                .status(400)
                .json({
                    message:
                        "Missing required fields: jobTitle, jobDescriptionText, studyCaseBrief",
                });
        }

        const jobPosting = await createJobPosting(
            jobTitle,
            jobDescriptionText,
            studyCaseBriefFile
        );

        res.status(201).json({
            jobId: jobPosting.id,
            message: "Job posting created successfully.",
        });
    } catch (error) {
        logger.error("Create Job Posting Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default jobController;
