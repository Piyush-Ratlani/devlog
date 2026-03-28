import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @MaxLength(50, { message: "Name must be less than 50 characters" })
  @MinLength(2, { message: "Name must be atleast 2 characters" })
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name!: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email address" })
  email!: string;

  @MaxLength(100, { message: "Password must be less than 100 characters" })
  @MinLength(8, { message: "Password must be atleast 8 characters" })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password!: string;
}

export class LoginDto {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email address" })
  email!: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password!: string;
}
