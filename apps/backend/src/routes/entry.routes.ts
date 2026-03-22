import { Router } from "express";
import {
  createEntry,
  deleteEntry,
  getEntries,
} from "../controllers/entry.controller";

const router = Router();

// POST /api/entries
router.post("/", createEntry);

// GET /api/entries
router.get("/", getEntries);

// DELETE /api/entries/:id
router.delete("/:id", deleteEntry);

export default router;
