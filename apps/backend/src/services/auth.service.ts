import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../types/error.types";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import type {
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
} from "../types/auth.types";

interface LoginServiceResponse extends AuthResponse {
  refreshToken: string;
}

export const registerUser = async (
  body: RegisterRequestBody,
): Promise<AuthResponse> => {
  const { email, name, password } = body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) throw new AppError("Email already in use", 409);

  // Hash password
  const hashedPassword = await bcrypt.hash(password, Number(env.BCRYPT_ROUNDS));

  // Create user
  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    status: "success",
    message: "User registered successfully.",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    },
  };
};

export const loginUser = async (
  body: LoginRequestBody,
): Promise<LoginServiceResponse> => {
  const { email, password } = body;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new AppError("Invalid email or password", 401);

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

  // Generate tokens
  const accessToken = generateAccessToken({
    email: user.email,
    userId: user.id,
  });

  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    status: "success",
    message: "Login successful",
    refreshToken,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    },
  };
};

export const refreshAccessToken = async (
  token: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Verify token signature
  const payload = verifyRefreshToken(token);

  // Check if token exists in DB and is not expired
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.expiresAt < new Date())
    throw new AppError("Invalid or expired refresh token.", 401);

  if (storedToken.userId !== payload.userId)
    throw new AppError("Invalid refresh token.", 401);

  // Issue new access token
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user) throw new AppError("User not found", 404);

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const newRefreshToken = generateRefreshToken({ userId: user.id });

  // Store new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};
