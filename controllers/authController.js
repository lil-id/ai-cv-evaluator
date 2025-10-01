import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddleware.js";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
} from "../models/authModel.js";
import {
    registerSchema,
    loginSchema,
    refreshSchema,
} from "../utils/validator/auth.js";

const authController = Router();

/**
 * @route POST /auth/register
 * @desc Register a new recruiter (Admin only)
 * @body { name, email, password, role }
 * @returns { id, name, email, role, createdAt, updatedAt }
 */
authController.post("/register", isAuthenticated, isAdmin,  async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const user = await registerUser(req.body);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        logger.error("Register Error:", error);
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Email already exists." });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route POST /auth/login
 * @access Public
 * @desc Login as recruiter
 * @body { email, password }
 * @returns { accessToken, refreshToken }
 */
authController.post("/login", async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const { email, password } = req.body;
        const tokens = await loginUser(email, password);
        res.status(200).json(tokens);
    } catch (error) {
        logger.error("Login Error:", error);
        res.status(401).json({ message: error.message });
    }
});

/**
 * @route POST /auth/refresh-token
 * @access Public
 * @desc Refresh access token
 * @body { refreshToken }
 * @returns { accessToken }
 */
authController.post("/refresh-token", async (req, res) => {
    const { error } = refreshSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const { refreshToken } = req.body;
        const newAccessToken = await refreshAccessToken(refreshToken);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        logger.error("Refresh Token Error:", error);
        res.status(401).json({ message: error.message });
    }
});

export default authController;
