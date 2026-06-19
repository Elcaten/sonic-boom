import { appLogger } from "@/shared/lib/logger";
import * as Crypto from "expo-crypto";
import { SubsonicAPI } from "subsonic-api";

type CreateSubsonicAPIParams = {
  serverAddress: string;
  username: string;
  password: string;
};

export function createSubsonicAPI({ serverAddress, username, password }: CreateSubsonicAPIParams) {
  return new SubsonicAPI({
    url: serverAddress,
    auth: { username, password },
    salt: generateSalt(),
    reuseSalt: true,
    fetch: (params) => {
      if (typeof params === "string") {
        try {
          const url = new URL(params);
          url.searchParams.delete("v");
          url.searchParams.delete("c");
          url.searchParams.delete("f");
          url.searchParams.delete("u");
          url.searchParams.delete("t");
          url.searchParams.delete("s");
          appLogger.API.info(
            `${url.pathname} ${Array.from(url.searchParams.entries())
              .map(([k, v]) => `${k} = ${v}`)
              .join(" & ")}`,
          );
        } catch (e) {
          appLogger.API.error(e);
        }
      }
      return fetch(params);
    },
  });
}

function generateSalt(): string {
  const randomBytes = Crypto.getRandomBytes(16);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
