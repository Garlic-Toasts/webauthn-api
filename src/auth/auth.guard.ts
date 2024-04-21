import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const authHeader = context.switchToHttp().getRequest().headers.authorization;
            const sessionId = authHeader?.split(" ")[1];
            const session = await this.authService.getUserBySessionId(sessionId);
            return !!session;
        } catch (e) {
            throw new UnauthorizedException(e, "Не удалось авторизоваться в аккаунт. (Guard)");
        }
    }
}
