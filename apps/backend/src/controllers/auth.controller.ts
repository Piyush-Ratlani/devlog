import { Request, Response } from "express";
import {
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
} from "../types/auth.types";

export const register = (
  req: Request<{}, AuthResponse, RegisterRequestBody>,
  res: Response<AuthResponse>,
): void => {
  const { email, name } = req.body;

  // TODO: Week 3 — hash password, save user to DB, generate JWT
  res.status(201).json({
    status: "success",
    message: "User registered successfully (stub)",
    data: {
      user: {
        id: "stub-id-001",
        email,
        name,
      },
      accessToken: "stub-token",
    },
  });
};

export const login = (
  req: Request<{}, AuthResponse, LoginRequestBody>,
  res: Response<AuthResponse>,
): void => {
  const { email } = req.body;

  // TODO: Week 3 — verify password, query DB, generate JWT + refresh token
  res.status(200).json({
    status: "success",
    message: "User registered successfully (stub)",
    data: {
      user: {
        id: "stub-id-001",
        email,
        name: "Stub User",
      },
      accessToken: "stub-token",
    },
  });
};
