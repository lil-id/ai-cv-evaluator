import 'dotenv/config';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify if the user is authenticated.
 * Checks for a valid JWT token in the Authorization header.
 * If valid, attaches the decoded user information to req.user.
 * If invalid or absent, responds with a 401 Unauthorized status.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Authentication token required." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

/**
 * Middleware to verify if the authenticated user has admin privileges.
 * Checks if req.user.role is "ADMIN".
 * If the user is an admin, calls next() to proceed.
 * If not, responds with a 403 Forbidden status.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        next();
    } else {
        return res.status(403).json({ message: "Forbidden: Admins only." });
    }
};
