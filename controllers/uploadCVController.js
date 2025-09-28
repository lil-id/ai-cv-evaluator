import multer from "multer";
import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { saveFileData } from "../models/uploadCVModel.js";
import { generateUniqueFilename } from "../utils/file/fileUtility.js";

// Konfigurasi Multer untuk menangani penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5MB
    },
});

const uploadCVController = Router();

uploadCVController.post(
    "/upload",
    upload.fields([
        { name: "cv", maxCount: 1 },
        { name: "projectReport", maxCount: 1 },
        { name: "studyCaseBrief", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            if (
                !req.files ||
                !req.files.cv ||
                !req.files.projectReport ||
                !req.files.studyCaseBrief
            ) {
                return res.status(400).json({
                    message:
                        "Missing one or more required files (cv, projectReport, studyCaseBrief).",
                });
            }

            const filesData = {
                cv: req.files.cv[0],
                projectReport: req.files.projectReport[0],
                studyCaseBrief: req.files.studyCaseBrief[0],
            };        

            const savedFiles = await saveFileData(filesData);

            res.status(201).json({
                message: "Files uploaded successfully.",
                files: savedFiles,
            });
        } catch (error) {
            logger.error("Error uploading files:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default uploadCVController;
