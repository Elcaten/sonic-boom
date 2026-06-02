import { CoverArt } from "@/components";
import { Host, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  contentShape,
  disabled,
  font,
  foregroundStyle,
  frame,
  onTapGesture,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useActiveMediaItem } from "@rntp/player";
import { useRouter } from "expo-router";
import { PlayerButton } from "./PlayerButton";
import { MediaItemExtras } from "../types";

export function FloatingPlayer({ actions }: { actions: ("play-pause" | "prev-next")[] }) {
  const router = useRouter();
  const activeTrack = useActiveMediaItem();
  const activeTrackExtra = activeTrack?.extras as MediaItemExtras | undefined;

  const handlePress = () => {
    if (!activeTrackExtra?.albumId || !activeTrackExtra?.artistId) {
      return;
    }
    router.navigate({
      pathname: "/active-track",
      params: { albumId: activeTrackExtra.albumId, artistId: activeTrackExtra.artistId },
    });
  };

  const isDisabled = !activeTrack;
  const buttonColor = isDisabled ? undefined : "primary";

  return (
    <Host style={{ flex: 1, marginInlineStart: 14, marginInlineEnd: 14 }}>
      <HStack
        spacing={12}
        modifiers={[contentShape(shapes.rectangle()), onTapGesture(handlePress), disabled(isDisabled)]}
      >
        <VStack modifiers={[frame({ width: 32, height: 32 })]}>
          <CoverArt id={activeTrackExtra?.albumId} size={32} />
        </VStack>
        {activeTrack ? (
          <VStack alignment="leading">
            <Text modifiers={[font({ textStyle: "callout", weight: "medium" })]}>
              {activeTrack.title ?? ""}
            </Text>
            <Text
              modifiers={[
                font({ textStyle: "footnote" }),
                foregroundStyle({ type: "hierarchical", style: "secondary" }),
              ]}
            >
              {activeTrack.artist ?? ""}
            </Text>
          </VStack>
        ) : (
          <Text modifiers={[font({ textStyle: "footnote", weight: "medium" })]}>Not playing</Text>
        )}
        <Spacer />
        {actions.includes("prev-next") && <PlayerButton.Previous size={16} color={buttonColor} />}
        {actions.includes("play-pause") && <PlayerButton.PlayPause size={24} color={buttonColor} />}
        {actions.includes("prev-next") && <PlayerButton.Next size={16} color={buttonColor} />}
      </HStack>
    </Host>
  );
}
