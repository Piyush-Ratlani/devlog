import { Router } from "express";
import {
  createEntryHandler,
  deleteEntryHandler,
  getEntriesHandler,
} from "../controllers/entry.controller";
import { validate } from "../middleware/validate";
import { createEntrySchema } from "../schemas/entry.schema";
import { protect } from "../middleware/auth";

const router = Router();

// All entry routes require authentication
router.use(protect);

// POST /api/entries
router.post("/", validate(createEntrySchema), createEntryHandler);

// GET /api/entries
router.get("/", getEntriesHandler);

// DELETE /api/entries/:id
router.delete("/:id", deleteEntryHandler);

export default router;
