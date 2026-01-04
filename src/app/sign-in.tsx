import { useAuth } from "@/context/auth-context";
import {
  Button,
  Form,
  Host,
  Image,
  SecureField,
  Spacer,
  Text,
  TextField,
  VStack,
} from "@expo/ui/swift-ui";
import { frame, padding } from "@expo/ui/swift-ui/modifiers";
import React, { useState } from "react";

export default function LoginForm() {
  const [serverAddress, setServerAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const auth = useAuth();

  const handleSubmit = () => {
    //TODO: validate
    auth.setServerAddress(serverAddress);
    auth.setUsername(username);
    auth.setPassword(password);
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <VStack spacing={20}>
          <Spacer />

          {/** Heaeder*/}
          <VStack spacing={8} modifiers={[padding({ bottom: 40 })]}>
            <Image
              systemName="person.circle.fill"
              size={80}
              color="primary"
              modifiers={[frame({ width: 80, height: 80 })]}
            />
            <Text size={32} weight="bold">
              Welcome Back
            </Text>
            <Text size={20} color="secondary">
              Sign in to continue
            </Text>
          </VStack>

          {/** Form Fields*/}
          <VStack
            alignment="leading"
            spacing={16}
            modifiers={[padding({ horizontal: 20 })]}
          >
            <VStack alignment="leading" spacing={8}>
              <Text weight="medium" color="secondary">
                Server Address
              </Text>
              <TextField
                placeholder="https://example.com"
                onChangeText={setServerAddress}
                keyboardType="url"
                autocorrection={false}
                a
              ></TextField>
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text weight="medium" color="secondary">
                Username
              </Text>
              <TextField
                placeholder="admin"
                onChangeText={setUsername}
                autocorrection={false}
              ></TextField>
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text weight="medium" color="secondary">
                Password
              </Text>
              <SecureField
                placeholder="admin"
                onChangeText={setPassword}
              ></SecureField>
            </VStack>
          </VStack>

          {/** Sign In Button*/}
          <Button
            // controlSize="extraLarge"
            onPress={handleSubmit}
            modifiers={[padding({ bottom: 20 })]}
          >
            Sign In
          </Button>
        </VStack>
      </Form>
    </Host>
  );
}
