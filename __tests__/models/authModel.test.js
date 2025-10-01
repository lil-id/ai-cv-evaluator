import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../helpers/db/prisma.js";
import {
    loginUser,
    registerUser,
} from "../../models/authModel.js";
import { jest, describe, it, expect, afterEach } from "@jest/globals";

jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    },
}));

jest.mock("../../helpers/db/prisma.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

describe("Auth Service", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test for Registration
    describe("registerUser", () => {
        it("should hash password and create a new user", async () => {
            const userData = {
                email: "new@test.com",
                name: "New User",
                password: "password123",
                role: "RECRUITER",
            };

            const mockCreatedUser = { id: "456", ...userData, password: "hashedPassword123" };

            jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword123");

            const createSpy = jest.spyOn(prisma.user, 'create').mockResolvedValue(mockCreatedUser);

            await registerUser(userData);

            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

            expect(createSpy).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    name: userData.name,
                    password: "hashedPassword123",
                    role: userData.role,
                },
            });
        });
    });

    // Test for Login
    describe("loginUser", () => {
        it("should throw an error if user is not found", async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(
                loginUser("test@test.com", "password")
            ).rejects.toThrow("Invalid credentials");
        });

        it("should throw an error for invalid password", async () => {
            const mockUser = {
                email: "test@test.com",
                password: "hashedPassword",
            };
            
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            await expect(
                loginUser("test@test.com", "wrongpassword")
            ).rejects.toThrow("Invalid credentials");
        });

        it("should return access and refresh tokens on successful login", async () => {
            // Set up all the data and mock behaviors first.
            const mockUser = {
                id: "123",
                email: "test@test.com",
                password: "hashedPassword",
                role: "RECRUITER",
            };

            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prisma.user, 'update').mockResolvedValue({});
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, options) => {
                return options.expiresIn === "15m" ? "fakeAccessToken" : "fakeRefreshToken";
            });

            // Run the function we want to test.
            const result = await loginUser("test@test.com", "password");

            // Check if the results are what we expect.
            expect(result).toEqual({
                accessToken: "fakeAccessToken",
                refreshToken: "fakeRefreshToken",
            });

            // Verify that the refresh token was saved to the database
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { refreshToken: "fakeRefreshToken" },
            });
        });
    });
});
