import { SignInCredentials } from "./types";
import * as SecureStore from "expo-secure-store";

class AuthStorage {
  public static keys = {
    SERVER_ADDRESS: "server_address",
    USERNAME: "username",
    PASSWORD: "password",
  };

  async getCredentials() {
    const [serverAddress, username, password] = await Promise.all([
      SecureStore.getItemAsync(AuthStorage.keys.SERVER_ADDRESS),
      SecureStore.getItemAsync(AuthStorage.keys.USERNAME),
      SecureStore.getItemAsync(AuthStorage.keys.PASSWORD),
    ]);
    return { serverAddress, username, password };
  }

  async saveCredentials(credentials: SignInCredentials) {
    await Promise.all([
      SecureStore.setItemAsync(AuthStorage.keys.SERVER_ADDRESS, credentials.serverAddress),
      SecureStore.setItemAsync(AuthStorage.keys.USERNAME, credentials.username),
      SecureStore.setItemAsync(AuthStorage.keys.PASSWORD, credentials.password),
    ]);
  }

  async clearCredentials() {
    await Promise.all([
      SecureStore.deleteItemAsync(AuthStorage.keys.SERVER_ADDRESS),
      SecureStore.deleteItemAsync(AuthStorage.keys.USERNAME),
      SecureStore.deleteItemAsync(AuthStorage.keys.PASSWORD),
    ]);
  }
}

export const authStorage = new AuthStorage();
