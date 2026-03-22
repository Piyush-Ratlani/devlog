import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";

const app = express();

// ── Security & Parsing Middleware ──────────────────────────────────
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Health Check ───────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes (stubs coming next) ─────────────────────────────────────
// app.use('/api/auth', authRouter);
// app.use('/api/entries', entriesRouter);

// ── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// ── Start Server ───────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`[server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`[server] Health check → http://localhost:${env.PORT}/health`);
});

export default app;
