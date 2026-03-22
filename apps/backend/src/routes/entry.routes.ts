import { Router } from "express";
import {
  createEntry,
  deleteEntry,
  getEntries,
} from "../controllers/entry.controller";
import { validate } from "../middleware/validate";
import { createEntrySchema } from "../schemas/entry.schema";

const router = Router();

// POST /api/entries
router.post("/", validate(createEntrySchema), createEntry);

// GET /api/entries
router.get("/", getEntries);

// DELETE /api/entries/:id
router.delete("/:id", deleteEntry);

export default router;
