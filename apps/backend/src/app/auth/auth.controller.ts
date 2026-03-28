import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { AuthenticatedRequest, JwtGuard } from "./jwt.guard";

@Controller("/api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(dto);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token not found",
      });
    }

    const result = await this.authService.refresh(token);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Token refreshed sucessfully",
      data: { accessToken: result.accessToken },
    });
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.refreshToken;

    if (token) {
      await this.authService.logout(token);
    }

    res.clearCookie("refreshToken");
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  }

  @Get("me")
  @UseGuards(JwtGuard)
  async getMe(@Req() req: Request, @Res() res: Response) {
    const { userId } = req as AuthenticatedRequest;
    const result = await this.authService.getMe(userId);

    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: result,
    });
  }
}
