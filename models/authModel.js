import 'dotenv/config';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../helpers/db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const registerUser = async (userData) => {
    const { email, name, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { email, name, password: hashedPassword, role },
    });
};

export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });

    // Simpan refresh token ke database
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: refreshToken },
    });

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (token) => {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await prisma.user.findFirst({
        where: { id: decoded.userId, refreshToken: token },
    });

    if (!user) throw new Error("Invalid refresh token");

    const newAccessToken = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
    return newAccessToken;
};
