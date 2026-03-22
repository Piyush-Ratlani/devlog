import { Request, Response } from "express";
import {
  CreateEntryRequestBody,
  Entry,
  EntryResponse,
  EntriesResponse,
} from "../types/entry.types";

export const createEntry = (
  req: Request<{}, EntryResponse, CreateEntryRequestBody>,
  res: Response<EntryResponse>,
): void => {
  const { date, hours, mood, project, tags, notes } = req.body;

  // TODO: Week 3 — validate input, save to DB via Prisma, return real entry
  const stubEntry: Entry = {
    id: "stub-entry-001",
    date,
    hours,
    mood,
    project,
    tags,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(201).json({
    status: "success",
    message: "Entry created successfully (stub)",
    data: stubEntry,
  });
};

export const getEntries = (
  _req: Request,
  res: Response<EntriesResponse>,
): void => {
  // TODO: Week 3 — query DB, support filter by date range and tags
  const stubEntries: Entry[] = [
    {
      id: "stub-entry-001",
      date: "2026-03-22",
      hours: 6,
      project: "DevLog",
      tags: ["typescript", "backend"],
      mood: "great",
      notes: "Set up the entire backend structure",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "stub-entry-002",
      date: "2026-03-21",
      hours: 4,
      project: "DevLog",
      tags: ["express", "routes"],
      mood: "good",
      notes: "Built stub routes and controllers",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  res.status(200).json({
    status: "success",
    message: "Entries fetched successfully (stub)",
    data: stubEntries,
  });
};

export const deleteEntry = (
  req: Request<{ id: string }>,
  res: Response,
): void => {
  const { id } = req.params;

  // TODO: Week 3 — verify entry belongs to user, delete from DB
  res.status(200).json({
    status: "success",
    message: `Entry ${id} deleted successfully (stub)`,
  });
};
