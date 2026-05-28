import { useAuth } from "@/context/app-context";
import { TextInput } from "@expo/ui";
import { Button, Form, Host, Section } from "@expo/ui/swift-ui";
import { frame, scrollDisabled } from "@expo/ui/swift-ui/modifiers";
import { useMutation } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Alert } from "react-native";
import { SubsonicAPI } from "subsonic-api";

export default function LoginForm() {
  const [serverAddress, setServerAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const auth = useAuth();

  const submit = useMutation({
    mutationFn: async () => {
      if (!serverAddress || !username || !password) {
        throw new Error("invalidCredentials");
      }

      const randomBytes = Crypto.getRandomBytes(16);
      const salt = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const api = new SubsonicAPI({
        url: serverAddress,
        auth: {
          username: username,
          password: password,
        },
        salt: salt,
        reuseSalt: true,
      });

      try {
        await api.navidromeSession();
      } catch (e) {
        throw new Error("invalidCredentials");
      }
    },
    onError: (error) => {
      Alert.alert("Could not sign in", "Please check you credentials and try again.");
    },
    onSuccess: () => {
      auth.setServerAddress(serverAddress);
      auth.setUsername(username);
      auth.setPassword(password);
    },
  });

  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={[scrollDisabled()]}>
        <Section title="Server Address">
          <TextInput
            placeholder="https://example.com"
            onChangeText={setServerAddress}
            keyboardType="url"
            autoCorrect={false}
          />
        </Section>

        <Section title="Credentials">
          <TextInput placeholder="admin" onChangeText={setUsername} autoCorrect={false} />

          <TextInput placeholder="password" onChangeText={setPassword} secureTextEntry />
        </Section>

        <Section>
          <Button
            onPress={submit.mutate}
            modifiers={[frame({ maxWidth: Infinity })]}
            label="Sign In"
          />
        </Section>
      </Form>
    </Host>
  );
}
