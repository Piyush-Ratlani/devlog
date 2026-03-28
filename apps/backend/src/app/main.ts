import { NestFactory } from "@nestjs/core";
import "reflect-metadata";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { env } from "../config/env";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { GlobalExceptionFilter } from "./filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  // ── Security ─────────────────────────────────────────────────────
  app.use(helmet());

  // ── Cookie Parser ────────────────────────────────────────────────
  app.use(cookieParser());

  // ── CORS ─────────────────────────────────────────────────────────
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // ── Global Validation Pipe ───────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // ── Global Exception Filter ──────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Health Check ─────────────────────────────────────────────────
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get("/health", (_req: any, res: any) => {
    res.status(200).json({
      status: "ok",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  await app.listen(env.PORT);
  console.log(`[server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`[server] Health check → http://localhost:${env.PORT}/health`);
}

bootstrap();
