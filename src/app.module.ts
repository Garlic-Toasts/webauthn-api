import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
    imports: [
        AuthModule,
        RedisModule,
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: "../.env",
        }),
    ],
})
export class AppModule {}
