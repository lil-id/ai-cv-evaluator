import 'dotenv/config';
import bcrypt from "bcrypt";
import prisma from "../db/prisma.js";

/**
 * Seed a default admin user into the database.
 * 
 * This script checks for the existence of an admin user with the email
 * specified in the environment variables. If not found, it creates
 * default admin user with the provided email and password.
 */
async function main() {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error(
            "Please provide INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env file"
        );
    }

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log("Admin user already exists.");
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
        data: {
            name: "Default Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log("Default admin user created successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
