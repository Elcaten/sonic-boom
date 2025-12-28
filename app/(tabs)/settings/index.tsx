import { useAuth } from "@/context/auth-context";
import { Button, Form, Host, HStack, Section } from "@expo/ui/swift-ui";

export default function SettingsView() {
  const auth = useAuth();
  const onSignOutPress = () => {
    auth.clearAll();
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <HStack spacing={16}>
            <Button
              systemImage="rectangle.portrait.and.arrow.right"
              onPress={onSignOutPress}
            >
              Sign out
            </Button>
          </HStack>
        </Section>
      </Form>
    </Host>
  );
}
