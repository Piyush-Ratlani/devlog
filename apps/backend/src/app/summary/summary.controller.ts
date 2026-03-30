import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { Request, Response } from "express";
import { SummaryService } from "./summary.service";
import { GenerateSummaryDto } from "./summary.dto";
import { JwtGuard, AuthenticatedRequest } from "../auth/jwt.guard";

@Controller("api/summary")
@UseGuards(JwtGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post("generate")
  @HttpCode(200)
  async generate(
    @Body() dto: GenerateSummaryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { userId } = req as AuthenticatedRequest;
    const summary = await this.summaryService.generateSummary(userId, dto);

    return res.status(200).json({
      status: "success",
      message: "Summary generated successfully",
      data: summary,
    });
  }

  @Get("latest")
  async getLatest(@Req() req: Request, @Res() res: Response) {
    const { userId } = req as AuthenticatedRequest;
    const summary = await this.summaryService.getLatestSummary(userId);

    return res.status(200).json({
      status: "success",
      message: summary ? "Summary fetched successfully" : "No summary yet",
      data: summary,
    });
  }
}
