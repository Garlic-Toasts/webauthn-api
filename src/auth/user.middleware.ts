import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

@Injectable()
export class UserMiddleware implements NestMiddleware {
    public constructor(private readonly authService: AuthService) {}
    async use(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sessionId = req.headers.authorization.split(" ")[1];
            (req as any).user = await this.authService.getUserBySessionId(sessionId);
        } catch (e) {}
        next();
    }
}
