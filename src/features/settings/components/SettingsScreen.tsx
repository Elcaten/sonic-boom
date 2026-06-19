import { SignOutButton } from "@/features/auth";
import { PrefetchAllAlbumImages, useRefreshCache } from "@/shared/api";
import { Button, Form, Host, HStack, ProgressView, Section, Spacer, Text } from "@expo/ui/swift-ui";
import { disabled, padding, progressViewStyle } from "@expo/ui/swift-ui/modifiers";
import { Link } from "expo-router";
import { View } from "react-native";

export default function SettingsScreen() {
  const {
    showFetcher,
    isRefreshing,
    progress,
    onRefreshPress,
    handleSmallImagesLoaded,
    handleLargeImagesLoaded,
  } = useRefreshCache();

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Host style={{ flex: 1 }}>
        <Form modifiers={isRefreshing ? [disabled()] : undefined}>
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
                {isRefreshing && showFetcher === "QUERIES" && (
                  <Text>{`${progress?.title ?? "Loading"}... ${progress?.progressPercentage ?? 0}%`}</Text>
                )}
                {isRefreshing && (showFetcher === 48 || showFetcher === 256) && (
                  <Text>Images...</Text>
                )}
                <Spacer />
                {isRefreshing && <ProgressView modifiers={[progressViewStyle("circular")]} />}
              </HStack>
            </Button>
            <SignOutButton />
          </Section>
        </Form>
      </Host>
      {showFetcher && (
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: "row",
            position: "absolute",
            inset: 0,
          }}
        >
          {showFetcher === 48 && (
            <PrefetchAllAlbumImages size={48} onLoadEnd={handleSmallImagesLoaded} />
          )}
          {showFetcher === 256 && (
            <PrefetchAllAlbumImages size={256} onLoadEnd={handleLargeImagesLoaded} />
          )}
        </View>
      )}
    </View>
  );
}
