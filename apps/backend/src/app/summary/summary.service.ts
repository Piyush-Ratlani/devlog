import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { env } from "../../config/env";
import { GenerateSummaryDto } from "./summary.dto";

@Injectable()
export class SummaryService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  async generateSummary(userId: string, dto: GenerateSummaryDto) {
    const { weekStart, weekEnd } = dto;

    // Fetch entries for the week
    const entries = await this.prisma.entry.findMany({
      where: {
        userId,
        date: {
          gte: new Date(weekStart),
          lte: new Date(weekEnd),
        },
      },
      include: { tags: true },
      orderBy: { date: "asc" },
    });

    if (entries.length === 0) {
      throw new BadRequestException(
        "No entries found for this week. Log some work first.",
      );
    }

    // Build prompt
    const entriesText = entries
      .map(e => {
        const tags = e.tags.map(t => t.name).join(", ");
        return `- ${new Date(e.date).toDateString()}: ${e.hours}h on ${e.project} [${tags}] — mood: ${e.mood}${e.notes ? `. Notes: ${e.notes}` : ""}`;
      })
      .join("\n");

    const prompt = `
    You are analyzing a software developer's weekly activity log. Based on the entries below, provide a structured summary.
    
    Weekly entries:
    ${entriesText}
    
    Respond with ONLY a valid JSON object in this exact format, no markdown, no extra text:
    {
      "themes": ["theme1", "theme2"],
      "wins": ["win1", "win2"],
      "risks": ["risk1", "risk2"],
      "generatedText": "A 2-3 sentence narrative summary of the week"
    }
    
    Guidelines:
    - themes: 2-4 recurring focus areas or technologies
    - wins: 2-3 positive patterns (high hours, good mood, consistent work)
    - risks: 1-3 concerns (low hours, bad mood days, inconsistent work, single point of focus)
    - generatedText: professional, encouraging, specific to the data
    `;

    // Call Gemini API
    let parsed: {
      themes: string[];
      wins: string[];
      risks: string[];
      generatedText: string;
    };

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Strip markdown code blocks if present
      const clean = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      parsed = JSON.parse(clean);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";

      // Handle quota/rate limit errors
      if (
        message.includes("quota") ||
        message.includes("429") ||
        message.includes("rate")
      ) {
        throw new InternalServerErrorException(
          "AI service quota exceeded. Please try again later.",
        );
      }

      // Handle invalid JSON from model
      if (err instanceof SyntaxError) {
        throw new InternalServerErrorException(
          "AI returned an unexpected response. Please try again.",
        );
      }

      throw new InternalServerErrorException(
        "AI service is currently unavailable. Please try again later.",
      );
    }

    // Compute stats
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const topProjects = [...new Set(entries.map(e => e.project))].slice(0, 3);
    const topTags = [
      ...new Set(entries.flatMap(e => e.tags.map(t => t.name))),
    ].slice(0, 5);

    // Delete existing summary for this week if any
    await this.prisma.weeklySummary.deleteMany({
      where: {
        userId,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
      },
    });

    // Store summary
    const summary = await this.prisma.weeklySummary.create({
      data: {
        userId,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        totalHours,
        topProjects,
        topTags,
        themes: parsed.themes,
        wins: parsed.wins,
        risks: parsed.risks,
        generatedText: parsed.generatedText,
        regeneratable: true,
      },
    });

    return summary;
  }

  async getLatestSummary(userId: string) {
    const summary = await this.prisma.weeklySummary.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return summary;
  }
}
