import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  registerUser,
  logoutUser,
  refreshAccessToken,
  loginUser,
} from "../services/auth.service";
import {
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
} from "../types/auth.types";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";
import { AppError } from "../types/error.types";

export const register = asyncHandler(
  async (
    req: Request<{}, AuthResponse, RegisterRequestBody>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const response = await registerUser(req.body);
    res.status(201).json(response);
  },
);

export const login = asyncHandler(
  async (
    req: Request<{}, AuthResponse, LoginRequestBody>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const response = await loginUser(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.status(200).json({
      status: response.status,
      message: response.message,
      data: response.data,
    });
  },
);

export const refresh = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Refresh token not found",
      });
      return;
    }

    const { accessToken, refreshToken } = await refreshAccessToken(token);

    // Rotate cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  },
);

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken;

    if (token) {
      await logoutUser(token);
    }

    res.clearCookie("refreshToken");
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  },
);

export const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req as AuthRequest;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: { user },
    });
  },
);
