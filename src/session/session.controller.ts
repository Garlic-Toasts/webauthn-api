import { Controller, Delete, Get, Param, UseGuards } from "@nestjs/common";
import { SessionService } from "./session.service";
import { Passkey, User } from "@prisma/client";
import { UserDecorator } from "../auth/user.decorator";
import { AuthGuard } from "../auth/auth.guard";

@Controller("session")
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Get()
    @UseGuards(AuthGuard)
    async getUserSessions(@UserDecorator() user: User): Promise<Passkey[]> {
        return this.sessionService.getUserSessions(user.id);
    }

    @Delete(":sessionId")
    @UseGuards(AuthGuard)
    async deleteUserSession(@Param("sessionId") sessionId: string): Promise<void> {
        await this.sessionService.deleteSession(sessionId);
    }
}
