import { AttestationFormat } from "@simplewebauthn/server/esm/helpers/decodeAttestationObject";
import type { Base64URLString, CredentialDeviceType } from "@simplewebauthn/server/esm/deps";
import { AuthenticationExtensionsAuthenticatorOutputs } from "@simplewebauthn/server/esm/helpers/decodeAuthenticatorExtensions";

export type RegistrationInfo = {
    fmt: AttestationFormat;
    counter: number;
    aaguid: string;
    credentialID: Base64URLString;
    credentialPublicKey: Uint8Array;
    credentialType: "public-key";
    attestationObject: Uint8Array;
    userVerified: boolean;
    credentialDeviceType: CredentialDeviceType;
    credentialBackedUp: boolean;
    origin: string;
    rpID?: string;
    authenticatorExtensionResults?: AuthenticationExtensionsAuthenticatorOutputs;
};
