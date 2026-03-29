import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthenticatedRequest, JwtGuard } from "../auth/jwt.guard";
import { EntriesService } from "./entries.service";
import { CreateEntryDto, UpdateEntryDto } from "./entries.dto";

@Controller("api/entries")
@UseGuards(JwtGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  async createEntry(
    @Body() dto: CreateEntryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { userId } = req as AuthenticatedRequest;
    const entry = await this.entriesService.createEntry(userId, dto);

    return res.status(201).json({
      status: "success",
      message: "Entry created successfully",
      data: entry,
    });
  }

  @Get()
  async getEntries(
    @Req() req: Request,
    @Res() res: Response,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("tags") tags?: string,
    @Query("project") project?: string,
  ) {
    const { userId } = req as AuthenticatedRequest;
    const entries = await this.entriesService.getEntries(userId, {
      startDate,
      endDate,
      project,
      tags,
    });

    return res.status(200).json({
      status: "success",
      message: "Entry fetched successfully",
      data: entries,
    });
  }

  @Patch(":id")
  async updateEntry(
    @Param("id") id: string,
    @Body() dto: UpdateEntryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { userId } = req as AuthenticatedRequest;
    const entry = await this.entriesService.updateEntry(userId, id, dto);

    return res.status(200).json({
      status: "success",
      message: "Entry updated successfully",
      data: entry,
    });
  }

  @Delete(":id")
  async deleteEntry(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { userId } = req as AuthenticatedRequest;
    await this.entriesService.deleteEntry(userId, id);

    return res.status(200).json({
      status: "success",
      message: "Entry deleted successfully",
    });
  }
}
