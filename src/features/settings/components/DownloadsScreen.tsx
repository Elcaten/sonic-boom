import { useDeleteAllDownloads } from "@/features/downloads";
import {
  Button,
  ConfirmationDialog,
  ContentUnavailableView,
  Host,
  List,
  Section,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  disabled,
  font,
  foregroundStyle,
  lineLimit,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useDownloadsSections } from "../hooks/useDownloadsSections";

export function DownloadsScreen() {
  const { sections, downloadedCount, isPending } = useDownloadsSections();
  const deleteAll = useDeleteAllDownloads();
  const [isDeleteConfirmationPresented, setDeleteConfirmationPresented] = useState(false);

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (downloadedCount === 0) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title="No Downloads"
          description="Swipe an album to save it for offline listening."
          systemImage="arrow.down.circle"
        />
      </Host>
    );
  }

  const handleDeleteAll = () => {
    setDeleteConfirmationPresented(false);
    deleteAll.mutate(undefined, {
      onError: (error) => Alert.alert("Could not delete downloads", String(error)),
    });
  };

  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle("inset")]}>
        <Section title="Management">
          <ConfirmationDialog
            title="Delete all downloads?"
            isPresented={isDeleteConfirmationPresented}
            onIsPresentedChange={setDeleteConfirmationPresented}
            titleVisibility="visible"
          >
            <ConfirmationDialog.Trigger>
              <Button
                label={deleteAll.isPending ? "Deleting…" : `Delete All ${downloadedCount} Songs`}
                role="destructive"
                modifiers={[disabled(deleteAll.isPending)]}
                onPress={() => setDeleteConfirmationPresented(true)}
              />
            </ConfirmationDialog.Trigger>
            <ConfirmationDialog.Message>
              <Text>Downloaded songs will no longer be available offline.</Text>
            </ConfirmationDialog.Message>
            <ConfirmationDialog.Actions>
              <Button label="Delete All" role="destructive" onPress={handleDeleteAll} />
              <Button
                label="Cancel"
                role="cancel"
                onPress={() => setDeleteConfirmationPresented(false)}
              />
            </ConfirmationDialog.Actions>
          </ConfirmationDialog>
        </Section>
        {sections.map((section) => (
          <Section key={section.artistId} title={section.title}>
            {section.songs.map((song) => (
              <VStack key={song.id} alignment="leading" spacing={2}>
                <Text modifiers={[font({ weight: "semibold" }), lineLimit(1)]}>{song.title}</Text>
                <Text
                  modifiers={[
                    foregroundStyle({ type: "hierarchical", style: "secondary" }),
                    lineLimit(1),
                  ]}
                >
                  {song.detail}
                </Text>
              </VStack>
            ))}
          </Section>
        ))}
      </List>
    </Host>
  );
}
