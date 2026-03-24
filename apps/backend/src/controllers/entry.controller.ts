import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import {
  createEntry,
  getEntries,
  deleteEntry,
} from "../services/entry.service";
import { EntryFilters } from "../types/entry.types";

export const createEntryHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req as AuthRequest;
    const entry = await createEntry(userId, req.body);

    res.status(201).json({
      status: "success",
      message: "Entry created successfully",
      data: entry,
    });
  },
);

export const getEntriesHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req as AuthRequest;

    const filters: EntryFilters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      project: req.query.project as string | undefined,
      tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
    };

    const entries = await getEntries(userId, filters);

    res.status(200).json({
      status: "success",
      message: "Entries fetched successfully",
      data: entries,
    });
  },
);

export const deleteEntryHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req as AuthRequest;
    const { id } = req.params as { id: string };

    await deleteEntry(userId, id);

    res.status(200).json({
      status: "success",
      message: `Entry deleted successfully`,
    });
  },
);
