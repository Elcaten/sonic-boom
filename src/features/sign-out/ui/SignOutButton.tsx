import { Button } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";
import { useSignOut } from "../model/use-sign-out";

export function SignOutButton() {
  const { signOut } = useSignOut();

  return <Button onPress={signOut} modifiers={[padding({ horizontal: 8 })]} label="Sign out" />;
}
