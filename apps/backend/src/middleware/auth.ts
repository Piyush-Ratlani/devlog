import { Request, Response, NextFunction } from "express";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt";
import { AppError } from "../types/error.types";

export interface AuthRequest extends Request {
  userId: string;
  email: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw new AppError("No token provided", 401);

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).email = payload.email;

    next();
  } catch (error) {
    next(new AppError("Invalide or expired token", 401));
  }
};
