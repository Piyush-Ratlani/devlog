import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEntryDto, UpdateEntryDto } from "./entries.dto";

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntry(userId: string, dto: CreateEntryDto) {
    const entry = await this.prisma.entry.create({
      data: {
        userId,
        date: new Date(dto.date),
        hours: dto.hours,
        project: dto.project,
        mood: dto.mood,
        notes: dto.notes,
        tags: {
          connectOrCreate: dto.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { tags: true },
    });

    return entry;
  }

  async getEntries(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      tags?: string;
      project?: string;
    },
  ) {
    const { startDate, endDate, project, tags } = filters;

    const entries = await this.prisma.entry.findMany({
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
        ...(tags && {
          tags: {
            some: { name: { in: tags.split(",") } },
          },
        }),
      },
      include: { tags: true },
      orderBy: { date: "desc" },
    });

    return entries;
  }

  async updateEntry(userId: string, entryId: string, dto: UpdateEntryDto) {
    const entry = await this.prisma.entry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException("Entry not found");
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException("Not authorized to update this entry");
    }

    const updated = await this.prisma.entry.update({
      where: { id: entryId },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.hours !== undefined && { hours: dto.hours }),
        ...(dto.project && { project: dto.project }),
        ...(dto.mood && { mood: dto.mood }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.tags && {
          tags: {
            set: [],
            connectOrCreate: dto.tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
      include: { tags: true },
    });

    return updated;
  }

  async deleteEntry(userId: string, entryId: string) {
    const entry = await this.prisma.entry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException("Entry not found");
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException("Not authorized to delete this entry");
    }

    await this.prisma.entry.delete({ where: { id: entryId } });
  }
}
