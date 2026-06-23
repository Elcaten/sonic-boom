import { createSubsonicAPI } from "@/shared/api/api-context/create-subsonic-api";
import { appLogger } from "@/shared/lib/logger";
import { SignInCredentials } from "./types";

export async function verifySubsonicCredentials({
  serverAddress,
  username,
  password,
}: SignInCredentials) {
  const api = createSubsonicAPI({ serverAddress, username, password });

  try {
    await api.navidromeSession();
  } catch (e) {
    appLogger.API.error("Invalid credentials", { cause: e });
    throw new Error("Invalid credentials");
  }
}
