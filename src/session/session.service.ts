import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Passkey } from "@prisma/client";

@Injectable()
export class SessionService {
    constructor(private readonly prisma: PrismaService) {}

    public async getUserSessions(userId: number): Promise<Passkey[]> {
        return this.prisma.passkey.findMany({
            where: {
                userId: userId,
                counter: {
                    gt: 0,
                },
            },
        });
    }

    public async deleteSession(sessionId: string): Promise<void> {
        this.prisma.passkey.delete({
            where: {
                id: sessionId,
            },
        });
    }
}
