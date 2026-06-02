import { useSignIn } from "@/features/auth";
import { TextInput } from "@expo/ui";
import { Button, Form, Host, Section } from "@expo/ui/swift-ui";
import { disabled, frame, scrollDisabled } from "@expo/ui/swift-ui/modifiers";
import { Alert } from "react-native";

export default function SignInScreen() {
  const { setServerAddress, setUsername, setPassword, signInAsync, isLoading } = useSignIn();

  const handleSignIn = async () => {
    try {
      await signInAsync();
    } catch {
      Alert.alert("Could not sign in", "Please check your credentials and try again.");
    }
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={[scrollDisabled(), disabled(isLoading)]}>
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
            onPress={handleSignIn}
            modifiers={[frame({ maxWidth: Infinity })]}
            label={isLoading ? "Signing In..." : "Sign In"}
          />
        </Section>
      </Form>
    </Host>
  );
}
