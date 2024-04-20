import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
    AuthenticationResponseJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from "@simplewebauthn/types";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post("/create/:login")
    async register(@Param("login") login: string): Promise<void> {
        await this.authService.createUser(login);
    }

    @Get("/register/:login")
    async getRegisterOptions(
        @Param("login") login: string
    ): Promise<PublicKeyCredentialRequestOptionsJSON> {
        return this.authService.registerUser(login);
    }

    @Post("/register/:login")
    async verifyRegistration(
        @Param("login") login: string,
        @Body() body: RegistrationResponseJSON
    ): Promise<any> {
        return this.authService.verifyRegistrationResponse(login, body);
    }

    @Get("/login/:login")
    async getAuthOptions(
        @Param("login") login: string
    ): Promise<PublicKeyCredentialRequestOptionsJSON> {
        return this.authService.login(login);
    }

    @Post("/login/:login")
    async verifyLogin(
        @Param("login") login: string,
        @Body() body: AuthenticationResponseJSON
    ): Promise<PublicKeyCredentialRequestOptionsJSON> {
        return this.authService.verifyLoginResponse(login, body);
    }
}
