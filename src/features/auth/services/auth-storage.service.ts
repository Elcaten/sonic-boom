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

  async saveServerAddress(value: string) {
    if (value) {
      await SecureStore.setItemAsync(AuthStorage.keys.SERVER_ADDRESS, value);
    } else {
      await SecureStore.deleteItemAsync(AuthStorage.keys.SERVER_ADDRESS);
    }
  }

  async saveUsername(value: string) {
    if (value) {
      await SecureStore.setItemAsync(AuthStorage.keys.USERNAME, value);
    } else {
      await SecureStore.deleteItemAsync(AuthStorage.keys.USERNAME);
    }
  }

  async savePassword(value: string) {
    if (value) {
      await SecureStore.setItemAsync(AuthStorage.keys.PASSWORD, value);
    } else {
      await SecureStore.deleteItemAsync(AuthStorage.keys.PASSWORD);
    }
  }

  async clearAll() {
    await Promise.all([
      SecureStore.deleteItemAsync(AuthStorage.keys.SERVER_ADDRESS),
      SecureStore.deleteItemAsync(AuthStorage.keys.USERNAME),
      SecureStore.deleteItemAsync(AuthStorage.keys.PASSWORD),
    ]);
  }
}

export const authStorage = new AuthStorage();
