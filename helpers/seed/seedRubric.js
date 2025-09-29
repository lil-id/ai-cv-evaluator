// scripts/seed.js
import fs from "fs/promises";
import pgvector from "pgvector";
import prisma from "../db/prisma.js";
import { createId } from '@paralleldrive/cuid2';
import { embedContent } from "../llm/gemini.js"; // Fungsi untuk membuat embedding
import logger from "../../utils/logger/logger.js";

async function main() {
    logger.info("Starting seeding process...");

    // 1. Baca data rubrik dari file JSON
    const rubricsFile = await fs.readFile("config/rubrics.json", "utf-8");
    const rubricsData = JSON.parse(rubricsFile);
    const allRubrics = [
        ...rubricsData.cvEvaluation,
        ...rubricsData.projectEvaluation,
    ];

    // 2. Hapus data lama (opsional, tapi baik untuk idempotensi)
    await prisma.vectorEmbedding.deleteMany({});
    logger.info("Old embeddings deleted.");

    // 3. Loop, buat embedding, dan simpan ke DB
    for (const rubric of allRubrics) {
        logger.info(`Embedding: "${rubric.parameter}"...`);

        // Buat embedding dari konten (ini akan menghasilkan array angka, misal: [0.1, 0.2, ...])
        const embeddingArray = await embedContent(rubric.content);

        const newId = createId();

        // Simpan ke database menggunakan Prisma Raw Query
        // Perhatikan: Gunakan $executeRawUnsafe karena kita perlu membangun string query secara dinamis
        // untuk menyisipkan nilai vektor yang sudah diformat.
        await prisma.$executeRawUnsafe(
            'INSERT INTO vectorembeddings (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)',
            newId,
            rubric.content,
            rubric.metadata,
            pgvector.toSql(embeddingArray),
        );
    }

    logger.info("Seeding process completed successfully!");
}

main()
    .catch((e) => {
        logger.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
