import fs from "fs/promises";
import pgvector from "pgvector";
import prisma from "../db/prisma.js";
import { createId } from "@paralleldrive/cuid2";
import { embedContent } from "../llm/gemini.js";
import logger from "../../utils/logger/logger.js";

/**
 * Seed rubric data into the database with vector embeddings.
 * 
 * This function reads rubric definitions from a JSON file, generates vector embeddings
 * for each rubric, and stores them in the database. It first clears any existing
 * embeddings to avoid duplicates.
 */
async function main() {
    logger.info("Starting seeding process...");

    const rubricsFile = await fs.readFile("config/rubrics.json", "utf-8");
    const allRubrics = JSON.parse(rubricsFile);

    await prisma.vectorEmbedding.deleteMany({});
    logger.info("Old embeddings deleted.");

    for (const rubric of allRubrics) {
        logger.info(`Processing: "${rubric.parameterName}"...`);

        const contentToEmbed = `Description: ${rubric.description}. Weight: ${rubric.weight}%. Scoring Guide: ${rubric.scoringGuide}.`;
        const embeddingArray = await embedContent(contentToEmbed);

        const metadata = {
            parameterName: rubric.parameterName,
            evaluationType: rubric.evaluationType,
            description: rubric.description,
            weight: rubric.weight,
            scoringGuide: rubric.scoringGuide,
        };

        const newId = createId();

        logger.info(
            `Embedding and saving "${rubric.parameterName}" to the database...`
        );
        await prisma.$executeRawUnsafe(
            "INSERT INTO vectorembeddings (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)",
            newId,
            contentToEmbed,
            metadata,
            pgvector.toSql(embeddingArray)
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
