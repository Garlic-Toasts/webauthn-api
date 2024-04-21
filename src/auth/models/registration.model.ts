import { RegistrationInfo } from "../types/registration-info.type";
import { User } from "@prisma/client";

export class RegistrationModel {
    success: boolean;
    authInfo: RegistrationInfo;
    user: User;
    passkeyId: string;
}
