import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors from ValidationPipe
      if (
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse &&
        Array.isArray((exceptionResponse as any).message)
      ) {
        return response.status(status).json({
          status: "fail",
          message: "Validation failed",
          errors: (exceptionResponse as any).message.map((msg: string) => ({
            message: msg,
          })),
        });
      }

      // Handle regular HTTP exceptions like ConflictException, UnauthorizedException
      return response.status(status).json({
        status: status >= 500 ? "error" : "fail",
        message:
          typeof exceptionResponse === "string"
            ? exceptionResponse
            : ((exceptionResponse as any).message ?? "An error occured"),
      });
    }

    // Handle unexpected errors
    console.error("[UNHANDLED ERROR]", exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error",
    });
  }
}
