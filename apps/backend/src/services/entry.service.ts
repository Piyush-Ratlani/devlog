import { prisma } from "../config/prisma";
import { AppError } from "../types/error.types";
import type {
  CreateEntryRequestBody,
  EntryFilters,
} from "../types/entry.types";

export const createEntry = async (
  userId: string,
  body: CreateEntryRequestBody,
) => {
  const { date, hours, project, tags, mood, notes } = body;

  const entry = await prisma.entry.create({
    data: {
      date: new Date(date),
      hours,
      project,
      mood,
      notes,
      userId,
      tags: {
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: { tags: true },
  });

  return entry;
};

export const getEntries = async (userId: string, filters: EntryFilters) => {
  const { startDate, endDate, tags, project } = filters;

  const entries = await prisma.entry.findMany({
    where: {
      userId,
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(project && { project }),
      ...(tags &&
        tags.length > 0 && {
          tags: {
            some: {
              name: { in: tags },
            },
          },
        }),
    },
    include: { tags: true },
    orderBy: { date: "desc" },
  });

  return entries;
};

export const deleteEntry = async (
  userId: string,
  entryId: string,
): Promise<void> => {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
  });

  if (!entry) throw new AppError("Entry not found", 404);

  if (entry.userId !== userId)
    throw new AppError("Not authorized to delete this entry", 403);

  await prisma.entry.delete({ where: { id: entryId } });
};
