import slugify from "slugify";
import pgvector from "pgvector";
import prisma from "../helpers/db/prisma.js";
import { createId } from "@paralleldrive/cuid2";
import { embedContent } from "../helpers/llm/gemini.js";

/**
 * Saves file data to the database.
 * 
 * @param {Object} studyCaseBrief - The file object containing metadata about the uploaded file.
 * @param {string} studyCaseBrief.originalname - The original name of the file.
 * @param {string} studyCaseBrief.path - The storage path of the file.
 * @param {string} studyCaseBrief.mimetype - The MIME type of the file.
 * @param {number} studyCaseBrief.size - The size of the file in bytes.
 * @returns {Promise<Object[]>} A promise that resolves to an array of saved file records.
 */
const saveFileData = async (studyCaseBrief) => {
    const savedFileRecords = await prisma.$transaction([
        prisma.uploadedFile.create({
            data: {
                originalFilename: studyCaseBrief.originalname,
                storagePath: studyCaseBrief.path,
                mimeType: studyCaseBrief.mimetype,
                fileSize: studyCaseBrief.size,
            },
        }),
    ]);
    return savedFileRecords;
};

/**
 * Creates a new job posting.
 * 
 * @param {string} title - The title of the job posting.
 * @param {string} description - The description of the job posting.
 * @param {Object} briefFile - The file object containing metadata about the study case brief.
 * @param {string} briefFile.originalname - The original name of the file.
 * @param {string} briefFile.path - The storage path of the file.
 * @param {string} briefFile.mimetype - The MIME type of the file.
 * @param {number} briefFile.size - The size of the file in bytes.
 * @returns {Promise<Object>} A promise that resolves to the newly created job posting object.
 */
export const createJobPosting = async (title, description, briefFile) => {
    const savedBriefFile = await saveFileData(briefFile);
    const descriptionEmbedding = await embedContent(description);
    const metadataObject = { type: "job_description", jobTitle: title };

    const newId = createId();

    await prisma.$executeRawUnsafe(
        "INSERT INTO vectorembeddings (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)",
        newId,
        description,
        metadataObject,
        pgvector.toSql(descriptionEmbedding)
    );

    const slug = slugify(title, { lower: true, strict: true });
    const uniqueId = createId().slice(0, 8);
    const jobId = `${slug}-${uniqueId}`;

    const newJobPosting = await prisma.jobPosting.create({
        data: {
            id: jobId,
            title: title,
            studyCaseBriefFileId: savedBriefFile[0].id,
            descriptionEmbeddingId: newId,
        },
    });

    return newJobPosting;
};

/**
 * Retrieves a job posting by its ID.
 * 
 * @param {string} jobId - The unique identifier of the job posting.
 * @returns {Promise<Object|null>} A promise that resolves to the job posting object if found, or null if not found.
 */
export const getJobPostingById = async (jobId) => {
    return await prisma.jobPosting.findUnique({
        where: { id: jobId },
        include: {
            studyCaseBriefFile: true,
        },
    });
};
