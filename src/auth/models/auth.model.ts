import { User } from "@prisma/client";
import { AuthInfo } from "../types/auth-info.type";

export class AuthModel {
    success: boolean;
    authInfo: AuthInfo;
    user: User;
    passkeyId: string;
}
