import * as Crypto from "expo-crypto";
import { SubsonicAPI } from "subsonic-api";

type SignInCredentials = {
  serverAddress: string;
  username: string;
  password: string;
};

class AuthService {
  async verifySubsonicCredentials({
    serverAddress,
    username,
    password,
  }: SignInCredentials): Promise<void> {
    if (!serverAddress || !username || !password) {
      throw new Error("Invalid credentials");
    }

    const salt = this.generateSalt();
    const api = new SubsonicAPI({
      url: serverAddress,
      auth: { username, password },
      salt,
      reuseSalt: true,
    });

    try {
      await api.navidromeSession();
    } catch {
      throw new Error("Invalid credentials");
    }
  }

  generateSalt(): string {
    const randomBytes = Crypto.getRandomBytes(16);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export const authService = new AuthService();
