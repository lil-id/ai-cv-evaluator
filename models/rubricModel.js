import fs from "fs/promises";
import pgvector from "pgvector";
import papaparse from "papaparse";
import prisma from "../helpers/db/prisma.js";
import { createId } from "@paralleldrive/cuid2";
import { embedContent } from "../helpers/llm/gemini.js";

// Data default untuk template
export const generateRubricTemplate = async () => {
    // Membaca data default dari file konfigurasi, bukan hardcode.
    const defaultRubricsJson = await fs.readFile(
        "config/rubrics.json",
        "utf-8"
    );
    const defaultRubrics = JSON.parse(defaultRubricsJson);
    // console.log(defaultRubrics);

    // Mengubah array objek menjadi string CSV
    return papaparse.unparse(defaultRubrics);
};

export const processAndSaveRubrics = async (fileBuffer) => {
    const csvString = fileBuffer.toString("utf-8");

    // 1. Parse CSV kembali menjadi JSON
    const parsed = papaparse.parse(csvString, {
        header: true,
        skipEmptyLines: true,
    });
    const rubricsData = parsed.data;

    // 2. Validasi Data
    for (const [index, rubric] of rubricsData.entries()) {
        if (!rubric.parameterName || !rubric.weight || !rubric.evaluationType) {
            const error = new Error(
                `Validation failed: Missing required field in row ${index + 2}.`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    // 3. Simpan ke DB dalam satu transaksi
    await prisma.$transaction(
        async (tx) => {
            // Menghapus data lama menggunakan query mentah
            await tx.$executeRaw`DELETE FROM rubrics`;
            await tx.$executeRaw`DELETE FROM vectorembeddings WHERE metadata->>'type' LIKE '%_evaluation'`;

            for (const rubric of rubricsData) {
                const content = `Description: ${rubric.description}. Weight: ${rubric.weight}%. Scoring Guide: ${rubric.scoringGuide}.`;
                const embeddingArray = await embedContent(content);

                const newEmbeddingId = createId();
                const newRubricId = createId();

                // Menyimpan embedding menggunakan $executeRawUnsafe
                await tx.$executeRawUnsafe(
                    "INSERT INTO vectorembeddings (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)",
                    newEmbeddingId,
                    content,
                    {
                        type: `${rubric.evaluationType.toLowerCase()}_evaluation`,
                        parameter: rubric.parameterName,
                    },
                    pgvector.toSql(embeddingArray)
                );

                // Menyimpan data rubrik terstruktur (bisa menggunakan Prisma Client biasa karena tidak ada tipe 'vector')
                await tx.rubric.create({
                    data: {
                        id: newRubricId,
                        parameterName: rubric.parameterName,
                        evaluationType: rubric.evaluationType,
                        description: rubric.description,
                        weight: parseInt(rubric.weight, 10),
                        scoringGuide: rubric.scoringGuide,
                        embeddingId: newEmbeddingId,
                    },
                });
            }
        },
        {
            timeout: 10000, // Timeout in milliseconds (e.g., 10 seconds)
        }
    );
};
