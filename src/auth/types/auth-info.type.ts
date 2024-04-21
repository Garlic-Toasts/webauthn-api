import type { Base64URLString, CredentialDeviceType } from "@simplewebauthn/server/script/deps";
import { AuthenticationExtensionsAuthenticatorOutputs } from "@simplewebauthn/server/script/helpers/decodeAuthenticatorExtensions";

export type AuthInfo = {
    credentialID: Base64URLString;
    newCounter: number;
    userVerified: boolean;
    credentialDeviceType: CredentialDeviceType;
    credentialBackedUp: boolean;
    origin: string;
    rpID: string;
    authenticatorExtensionResults?: AuthenticationExtensionsAuthenticatorOutputs;
};
