import * as SecureStore from 'expo-secure-store';

export const storeData = (key: string, value: string) => {
  try {
    const jsonValue = JSON.stringify(value);
    SecureStore.setItem(key, jsonValue);
  } catch (e) {
    // saving error
    console.log(e);
  }
};

export const getData = (key: string) => {
  try {
    const jsonValue = SecureStore.getItem(key);

    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    console.log(e);
  }
};
