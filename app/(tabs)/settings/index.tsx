import { useAuth } from "@/context/auth-context";
import { Button, Form, Host, Section } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";

export default function SettingsView() {
  const auth = useAuth();
  const onSignOutPress = () => {
    auth.clearAll();
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <Button
            systemImage="rectangle.portrait.and.arrow.right"
            onPress={onSignOutPress}
            modifiers={[padding({ horizontal: 8 })]}
          >
            Sign out
          </Button>
        </Section>
      </Form>
    </Host>
  );
}
