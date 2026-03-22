import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../types/error.types";

interface ErrorResponse {
  status: "error" | "fail";
  message: string;
  errors?: Record<string, string>[];
  stack?: string;
}

const handleZodError = (err: ZodError): AppError => {
  const message = err.issues
    .map(e => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
  return new AppError(message, 400);
};

export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default to 500 if nothing else matches
  let statusCode = 500;
  let status: "error" | "fail" = "error";
  let message = "Something went wrong";

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const appError = handleZodError(err);
    statusCode = appError.statusCode;
    status = appError.status;
    message = appError.message;
  }

  // Handle our custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  }

  // Handle unexpected programming errors
  else {
    console.error("[UNHANDLED ERROR]", err);
  }

  const response: ErrorResponse = { status, message };

  // Only expose stack trace in development
  if (process.env.NODE_ENV === "development") response.stack = err.stack;

  res.status(statusCode).json(response);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
