import * as Crypto from "expo-crypto";
import { SubsonicAPI } from "subsonic-api";

type CreateSubsonicAPIParams = {
  serverAddress: string;
  username: string;
  password: string;
  fetch?: ConstructorParameters<typeof SubsonicAPI>[0]["fetch"];
};

export function createSubsonicAPI({ serverAddress, username, password }: CreateSubsonicAPIParams) {
  return new SubsonicAPI({
    url: serverAddress,
    auth: { username, password },
    salt: generateSalt(),
    reuseSalt: true,
  });
}

function generateSalt(): string {
  const randomBytes = Crypto.getRandomBytes(16);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
