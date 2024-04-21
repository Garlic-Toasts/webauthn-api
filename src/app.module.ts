import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { SessionModule } from "./session/session.module";
import { UserMiddleware } from "./auth/user.middleware";
import { ProfileModule } from "./profile/profile.module";

@Module({
    imports: [
        AuthModule,
        RedisModule,
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: "../.env",
        }),
        SessionModule,
        ProfileModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserMiddleware).forRoutes("*");
    }
}
