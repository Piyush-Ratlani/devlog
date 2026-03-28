import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { JwtUtil } from "../../utils/jwt";

export interface AuthenticatedRequest extends Request {
  userId: string;
  email: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = JwtUtil.verifyAccessToken(token);
      (request as AuthenticatedRequest).userId = payload.userId;
      (request as AuthenticatedRequest).email = payload.email;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
