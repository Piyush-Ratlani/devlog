import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export enum MoodEnum {
  great = "great",
  good = "good",
  neutral = "neutral",
  bad = "bad",
  terrible = "terrible",
}

export class CreateEntryDto {
  @IsDateString({}, { message: "Date must be a valid ISO string" })
  date!: string;

  @Max(24, { message: "Hours cannot exceed 24" })
  @Min(0.5, { message: "Hours must be atleast 0.5" })
  @IsNumber({}, { message: "Hours must be a number" })
  hours!: number;

  @MaxLength(100, { message: "Project name must be less than 100 characters" })
  @IsString()
  project!: string;

  @IsString({ each: true })
  @ArrayMaxSize(10, { message: "Maximum 10 tags allowed" })
  @ArrayMinSize(1, { message: "At least one tag is required" })
  @IsArray()
  tags!: string[];

  @IsEnum(MoodEnum, {
    message: "Mood must be one of: great, good, neutral, bad, terrible",
  })
  mood!: MoodEnum;

  @MaxLength(500, { message: "Notes must be less than 500 characters" })
  @IsString()
  @IsOptional()
  notes!: string;
}
