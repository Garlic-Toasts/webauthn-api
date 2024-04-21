import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Passkey, User } from "@prisma/client";
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    VerifiedRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import {
    AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { RedisClientType } from "redis";
import { RegistrationModel } from "./models/registration.model";
import { AuthModel } from "./models/auth.model";

@Injectable()
export class AuthService {
    constructor(
        @Inject("REDIS_CLIENT") private redis: RedisClientType,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {}
    private async getUserByLogin(login: string): Promise<User> {
        try {
            return await this.prisma.user.findFirstOrThrow({
                where: { login },
            });
        } catch (e) {
            throw new BadRequestException(`Пользователя с логином ${login} не существует.`);
        }
    }

    public async getUserBySessionId(sessionId: string): Promise<User> {
        return this.prisma.user.findFirst({
            where: {
                passkeys: {
                    some: {
                        id: sessionId,
                    },
                },
            },
        });
    }

    public async createUser(login: string): Promise<User> {
        try {
            return await this.prisma.user.create({
                data: {
                    login,
                },
            });
        } catch (e) {
            throw new BadRequestException(`Данный логин уже занят.`);
        }
    }

    public async login(login: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
        const user = await this.getUserByLogin(login);
        const passkeys = await this.getUserPasskeys(user.login);
        const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
            rpID: await this.configService.get("RP_ID"),
            allowCredentials: passkeys.map((passkey) => ({
                id: passkey.id,
            })),
        });
        await this.redis.set(`webauthnoptions:${user.id}`, JSON.stringify(options));
        return options;
    }

    public async verifyLoginResponse(
        login: string,
        loginData: AuthenticationResponseJSON
    ): Promise<AuthModel> {
        const user = await this.getUserByLogin(login);
        const options = await this.getUserOptions(user.login);
        const rpId = await this.configService.get("RP_ID");
        const passkey = await this.getPasskeyById(loginData.id);
        if (!passkey) {
            throw new BadRequestException(`Необходимо еще раз вызвать челлендж регистрации.`);
        }

        let verification: VerifiedAuthenticationResponse;
        try {
            verification = await verifyAuthenticationResponse({
                response: loginData,
                expectedChallenge: options.challenge,
                expectedOrigin: `https://${rpId}`,
                expectedRPID: rpId,
                authenticator: {
                    ...passkey,
                    credentialID: passkey.id,
                    credentialPublicKey: new Uint8Array(passkey.public_key),
                    transports: passkey.transports as any[],
                },
            });
        } catch (error) {
            console.error(error);
            throw new BadRequestException(`Не удалось авторизоваться в аккаунт.`);
        }

        if (verification.verified)
            await this.updatePasskeyCounter(passkey.id, verification.authenticationInfo.newCounter);

        return {
            success: verification.verified,
            authInfo: verification.authenticationInfo,
            user: user,
            passkeyId: passkey.id,
        };
    }

    public async registerUser(login: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
        const user = await this.getUserByLogin(login);
        const userPasskeys = await this.getUserPasskeys(login);
        const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
            rpName: await this.configService.get("RP_NAME"),
            rpID: await this.configService.get("RP_ID"),
            userName: user.login,
            attestationType: "none",
            excludeCredentials: userPasskeys.map((passkey) => ({
                id: passkey.id,
            })),
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
                authenticatorAttachment: "platform",
            },
        });
        await this.redis.set(`webauthnoptions:${user.id}`, JSON.stringify(options));
        return options;
    }

    public async verifyRegistrationResponse(
        login: string,
        registerData: RegistrationResponseJSON
    ): Promise<RegistrationModel> {
        const user = await this.getUserByLogin(login);
        const options = await this.getUserOptions(user.login);
        const rpId = await this.configService.get("RP_ID");

        let verification: VerifiedRegistrationResponse;
        try {
            verification = await verifyRegistrationResponse({
                response: registerData,
                expectedChallenge: options.challenge,
                expectedOrigin: `https://${rpId}`,
                expectedRPID: rpId,
            });
        } catch (error) {
            console.error(error);
            throw new BadRequestException(`Не удалось верифицировать регистрацию.`);
        }
        const passkey = await this.createPasskey(
            login,
            verification,
            registerData.response.transports
        );
        return {
            success: verification.verified,
            authInfo: verification.registrationInfo,
            user: user,
            passkeyId: passkey.id,
        };
    }

    private async createPasskey(
        login: string,
        verification: VerifiedRegistrationResponse,
        transports: string[]
    ): Promise<Passkey> {
        const user = await this.getUserByLogin(login);
        const options = await this.getUserOptions(login);
        const { registrationInfo } = verification;
        const {
            credentialID,
            credentialPublicKey,
            counter,
            credentialDeviceType,
            credentialBackedUp,
        } = registrationInfo;
        return this.prisma.passkey.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                webauthnUserId: options.user.id,
                id: credentialID,
                public_key: Buffer.from(credentialPublicKey),
                counter: counter,
                backup_status: credentialBackedUp,
                deviceType: credentialDeviceType,
                transports: transports,
            },
        });
    }

    private async updatePasskeyCounter(passkeyId: string, counter: number): Promise<void> {
        await this.prisma.passkey.update({
            where: {
                id: passkeyId,
            },
            data: {
                counter: counter,
            },
        });
    }

    private async getUserPasskeys(login: string): Promise<Passkey[]> {
        const user = await this.getUserByLogin(login);
        return this.prisma.passkey.findMany({
            where: { userId: user.id },
        });
    }

    private async getPasskeyById(id: string): Promise<Passkey> {
        return this.prisma.passkey.findFirst({
            where: { id },
        });
    }

    private async getUserOptions(login: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
        const user = await this.getUserByLogin(login);
        const optionsString = await this.redis.get(`webauthnoptions:${user.id}`);
        if (!optionsString) throw new BadRequestException(`Не проведена регистрация пользователя.`);

        return JSON.parse(optionsString as string);
    }
}
