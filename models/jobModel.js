import slugify from "slugify";
import pgvector from "pgvector";
import prisma from "../helpers/db/prisma.js";
import { createId } from "@paralleldrive/cuid2";
import { embedContent } from "../helpers/llm/gemini.js";

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

export const createJobPosting = async (title, description, briefFile) => {
    // 1. Simpan file brief studi kasus
    const savedBriefFile = await saveFileData(briefFile);

    // 2. Buat embedding untuk deskripsi pekerjaan
    const descriptionEmbedding = await embedContent(description);

    // 3. Simpan embedding ke database
    const metadataObject = { type: "job_description", jobTitle: title };

    const newId = createId();

    await prisma.$executeRawUnsafe(
        "INSERT INTO vectorembeddings (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)",
        newId,
        description,
        metadataObject,
        pgvector.toSql(descriptionEmbedding)
    );

    // 4. Buat Job ID yang unik dan human-readable
    const slug = slugify(title, { lower: true, strict: true });
    const uniqueId = createId().slice(0, 8);
    const jobId = `${slug}-${uniqueId}`;

    // 5. Buat entitas JobPosting
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

export const getJobPostingById = async (jobId) => {
    return await prisma.jobPosting.findUnique({
        where: { id: jobId },
        include: {
            studyCaseBriefFile: true,
        },
    });
};
