import 'dotenv/config';
import bcrypt from "bcrypt";
import prisma from "../db/prisma.js";

async function main() {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error(
            "Please provide INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env file"
        );
    }

    // Periksa apakah admin sudah ada
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log("Admin user already exists.");
        return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Buat user admin baru
    await prisma.user.create({
        data: {
            name: "Default Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN", // Secara eksplisit mengatur perannya sebagai ADMIN
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
