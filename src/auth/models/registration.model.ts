import { RegistrationInfo } from "../types/registration-info.type";
import { Passkey, User } from "@prisma/client";

export class RegistrationModel {
    success: boolean;
    authInfo: RegistrationInfo;
    user: User;
    passkey: Passkey;
}
