import prisma from "../helpers/db/prisma.js";

/**
 * Saves metadata for multiple uploaded files to the database within a single transaction.
 * @param {object} filesData - An object containing the file objects from Multer.
 * @param {object} filesData.cv - The CV file object.
 * @param {object} filesData.projectReport - The Project Report file object.
 * @returns {Promise<Array>} A promise that resolves to an array of the created file records.
 */
export const saveFileData = async (filesData) => {
    const { cv, projectReport } = filesData;

    const savedFileRecords = await prisma.$transaction([
        prisma.uploadedFile.create({
            data: {
                originalFilename: cv.originalname,
                storagePath: cv.path,
                mimeType: cv.mimetype,
                fileSize: cv.size,
            },
        }),
        prisma.uploadedFile.create({
            data: {
                originalFilename: projectReport.originalname,
                storagePath: projectReport.path,
                mimeType: projectReport.mimetype,
                fileSize: projectReport.size,
            },
        }),
    ]);

    return savedFileRecords;
};
