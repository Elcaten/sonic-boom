import { PrefetchAllAlbumImages } from "@/components/Prefetcher";
import { useAuth } from "@/context/app-context";
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
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";

export default function SettingsView() {
  const [showFetcher, setShowFetcher] = useState<48 | 256 | undefined>(undefined);
  const isDisabled = Boolean(showFetcher);

  const showAlert = () =>
    Alert.alert(
      "Refresh Cache?",
      "This will delete all downloaded album data and artwork from this device. They will be downloaded again.",
      [
        {
          text: "Refresh",
          onPress: async () => {
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

  const auth = useAuth();
  const onSupportPress = () => {
    alert("Thank you ♥️");
  };
  const onRefreshPress = () => {
    showAlert();
  };
  const onSignOutPress = () => {
    auth.clearAll();
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Host style={{ flex: 1 }}>
        <Form modifiers={isDisabled ? [disabled()] : undefined}>
          <Section>
            <Link href="/settings/animations" asChild>
              <Button modifiers={[padding({ horizontal: 8 })]}>Animations</Button>
            </Link>
          </Section>

          <Section>
            <Button onPress={onSupportPress} modifiers={[padding({ horizontal: 8 })]}>
              Support
            </Button>
          </Section>

          <Section title="Server">
            <Button onPress={onRefreshPress} modifiers={[padding({ horizontal: 8 })]}>
              <HStack spacing={16}>
                <Text>Refresh Cache</Text>
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
            // opacity: 0,
          }}
        >
          {showFetcher === 48 && (
            <PrefetchAllAlbumImages
              size={showFetcher}
              onLoadEnd={() => {
                setShowFetcher(256);
              }}
            />
          )}
          {showFetcher === 256 && (
            <PrefetchAllAlbumImages
              size={showFetcher}
              onLoadEnd={() => {
                setShowFetcher(undefined);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
