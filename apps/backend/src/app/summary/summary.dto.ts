import { IsDateString, IsNotEmpty } from "class-validator";

export class GenerateSummaryDto {
  @IsDateString({}, { message: "weekStart must be a valid date" })
  @IsNotEmpty({ message: "weekStart is required" })
  weekStart!: string;

  @IsDateString({}, { message: "weekEnd must be a valid date" })
  @IsNotEmpty({ message: "weekEnd is required" })
  weekEnd!: string;
}
