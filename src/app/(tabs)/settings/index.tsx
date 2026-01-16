import { PrefetchAllAlbumImages } from "@/components/Prefetcher";
import { useAuth } from "@/context/app-context";
import { usePrefetchQueries } from "@/hooks/use-prefetch-queries";
import {
  Button,
  CircularProgress,
  Form,
  Host,
  HStack,
  Section,
  Spacer,
  Text,
} from "@expo/ui/swift-ui";
import { disabled, padding } from "@expo/ui/swift-ui/modifiers";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";

export default function SettingsView() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const prefetchQueries = usePrefetchQueries();

  const [showFetcher, setShowFetcher] = useState<48 | 256 | "QUERIES" | undefined>(undefined);
  const isDisabled = Boolean(showFetcher);

  const onRefreshPress = () => {
    Alert.alert(
      "Refresh Cache?",
      "This will delete all downloaded album data and artwork from this device. They will be downloaded again.",
      [
        {
          text: "Refresh",
          onPress: async () => {
            setShowFetcher("QUERIES");
            await prefetchQueries.trigger();
            await Image.clearMemoryCache();
            await Image.clearDiskCache();
            setShowFetcher(48);
          },
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const onSignOutPress = async () => {
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    await auth.clearAll();
    queryClient.clear();
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Host style={{ flex: 1 }}>
        <Form modifiers={isDisabled ? [disabled()] : undefined}>
          <Section>
            <Link href="/settings/animations" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]}>Animations</Button>
            </Link>
            <Link href="/settings/colors" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]}>Colors</Button>
            </Link>
          </Section>

          <Section title="Server">
            <Button onPress={onRefreshPress} modifiers={[padding({ horizontal: 8 })]}>
              <HStack spacing={16}>
                {!isDisabled && <Text>Refresh Cache</Text>}
                {isDisabled && showFetcher === "QUERIES" && (
                  <Text>
                    {`${prefetchQueries.progress?.title!}... ${
                      prefetchQueries.progress?.progressPercentage
                    }%`}
                  </Text>
                )}
                {isDisabled && (showFetcher === 48 || showFetcher === 256) && (
                  <Text>{`Images...`}</Text>
                )}
                <Spacer />
                {isDisabled && <CircularProgress />}
              </HStack>
            </Button>
            <Button onPress={onSignOutPress} modifiers={[padding({ horizontal: 8 })]}>
              Sign out
            </Button>
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
            <PrefetchAllAlbumImages size={48} onLoadEnd={() => setShowFetcher(256)} />
          )}
          {showFetcher === 256 && (
            <PrefetchAllAlbumImages size={256} onLoadEnd={() => setShowFetcher(undefined)} />
          )}
        </View>
      )}
    </View>
  );
}
