import { createSubsonicAPI } from "@/shared/api/api-context/create-subsonic-api";
import { SignInCredentials } from "./types";

export async function verifySubsonicCredentials({
  serverAddress,
  username,
  password,
}: SignInCredentials) {
  const api = createSubsonicAPI({ serverAddress, username, password });

  try {
    await api.navidromeSession();
  } catch {
    throw new Error("Invalid credentials");
  }
}
