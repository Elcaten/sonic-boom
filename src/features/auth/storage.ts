import * as SecureStore from "expo-secure-store";

class AuthStorage {
  public static keys = {
    SERVER_ADDRESS: "_server_address",
    USERNAME: "_username",
    PASSWORD: "_password",
  };

  async getCredentials() {
    const [serverAddress, username, password] = await Promise.all([
      SecureStore.getItemAsync(AuthStorage.keys.SERVER_ADDRESS),
      SecureStore.getItemAsync(AuthStorage.keys.USERNAME),
      SecureStore.getItemAsync(AuthStorage.keys.PASSWORD),
    ]);
    return { serverAddress, username, password };
  }

  async saveServerAddress(serverAddress: string) {
    await SecureStore.setItemAsync(AuthStorage.keys.SERVER_ADDRESS, serverAddress);
  }

  async saveUsername(username: string) {
    await SecureStore.setItemAsync(AuthStorage.keys.USERNAME, username);
  }

  async savePassword(password: string) {
    await SecureStore.setItemAsync(AuthStorage.keys.PASSWORD, password);
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
