import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [ProfileController],
})
export class ProfileModule {}
