import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { UserDecorator } from "../auth/user.decorator";
import { User } from "@prisma/client";

@Controller("profile")
export class ProfileController {
    constructor() {}

    @Get()
    @UseGuards(AuthGuard)
    async getProfile(@UserDecorator() user: User): Promise<User> {
        return user;
    }
}
