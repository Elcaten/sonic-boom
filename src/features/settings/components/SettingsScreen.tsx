import { SignOutButton } from "@/features/auth";
import { useRefreshCache } from "@/shared/api";
import { Button, Form, Host, HStack, ProgressView, Section, Spacer, Text } from "@expo/ui/swift-ui";
import { disabled, padding, progressViewStyle } from "@expo/ui/swift-ui/modifiers";
import { Link } from "expo-router";
import { View } from "react-native";

export default function SettingsScreen() {
  const { stage, isRefreshing, queryProgress, artworkProgress, onRefreshPress } =
    useRefreshCache();

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Host style={{ flex: 1 }}>
        <Form modifiers={isRefreshing ? [disabled()] : undefined}>
          <Section title="Library">
            <Link href="/settings/downloads" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]} label="Downloads" />
            </Link>
          </Section>
          <Section title="Developer">
            <Link href="/settings/animations" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]} label="Animations" />
            </Link>
            <Link href="/settings/colors" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]} label="Colors" />
            </Link>
          </Section>
          <Section title="Server">
            <Button onPress={onRefreshPress} modifiers={[padding({ horizontal: 8 })]}>
              <HStack spacing={16}>
                {!isRefreshing && <Text>Refresh Cache</Text>}
                {isRefreshing && stage === "QUERIES" && (
                  <Text>{`${queryProgress?.title ?? "Loading"}... ${queryProgress?.progressPercentage ?? 0}%`}</Text>
                )}
                {isRefreshing && stage === "ARTWORK" && (
                  <Text>{`Artwork... ${artworkProgress.progressPercentage}%`}</Text>
                )}
                <Spacer />
                {isRefreshing && <ProgressView modifiers={[progressViewStyle("circular")]} />}
              </HStack>
            </Button>
            <SignOutButton />
          </Section>
        </Form>
      </Host>
    </View>
  );
}
