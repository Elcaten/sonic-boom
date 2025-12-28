import { useAuth } from "@/context/auth-context";
import { Button, Form, Host, Section } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";

export default function SettingsView() {
  const auth = useAuth();
  const onSupportPress = () => {
    alert("Thank you ♥️");
  };
  const onSignOutPress = () => {
    auth.clearAll();
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <Button
            systemImage="dollarsign.square"
            onPress={onSupportPress}
            modifiers={[padding({ horizontal: 8 })]}
          >
            Support
          </Button>
        </Section>
        <Section>
          <Button
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
