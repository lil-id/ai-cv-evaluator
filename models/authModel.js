import 'dotenv/config';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../helpers/db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Registers a new user in the database.
 * 
 * @async
 * @function registerUser
 * @param {Object} userData - The data of the user to register.
 * @param {string} userData.email - The email of the user.
 * @param {string} userData.name - The name of the user.
 * @param {string} userData.password - The plain text password of the user.
 * @param {string} userData.role - The role of the user.
 * @returns {Promise<Object>} The created user object.
 */
export const registerUser = async (userData) => {
    const { email, name, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { email, name, password: hashedPassword, role },
    });
};

/**
 * Logs in a user by verifying their credentials and generating tokens.
 * 
 * @async
 * @function loginUser
 * @param {string} email - The email of the user.
 * @param {string} password - The plain text password of the user.
 * @returns {Promise<Object>} An object containing the access token and refresh token.
 * @throws {Error} If the credentials are invalid.
 */
export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "5d" }
    );
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });

    // Saved refresh token to database
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: refreshToken },
    });

    return { accessToken, refreshToken };
};

/**
 * Refreshes the access token using a valid refresh token.
 * 
 * @async
 * @function refreshAccessToken
 * @param {string} token - The refresh token.
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If the refresh token is invalid.
 */
export const refreshAccessToken = async (token) => {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await prisma.user.findFirst({
        where: { id: decoded.userId, refreshToken: token },
    });

    if (!user) throw new Error("Invalid refresh token");

    const newAccessToken = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "5d" }
    );
    return newAccessToken;
};
