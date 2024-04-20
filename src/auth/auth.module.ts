import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [PrismaModule, ConfigModule, RedisModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
