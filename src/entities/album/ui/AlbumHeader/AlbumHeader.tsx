import { CoverArt } from "@/shared/ui/CoverArt/CoverArt";
import { ReactNode } from "react";
import { HStack, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  frame,
  listRowSeparator,
  multilineTextAlignment,
} from "@expo/ui/swift-ui/modifiers";

type AlbumHeaderProps = {
  albumId: string;
  albumName?: string;
  artistName?: string;
  isWideLayout: boolean;
  actions: ReactNode;
};

export function AlbumHeader({
  albumId,
  albumName,
  artistName,
  isWideLayout,
  actions,
}: AlbumHeaderProps) {
  const Stack = isWideLayout ? HStack : VStack;
  const topSectionSpacing = 16;

  return (
    <Stack spacing={topSectionSpacing} modifiers={[listRowSeparator("hidden", "all")]}>
      <VStack modifiers={[frame({ width: 256, height: 256 })]}>
        <CoverArt id={albumId} size={256} elevated />
      </VStack>
      <VStack spacing={topSectionSpacing}>
        <VStack modifiers={[frame({ maxHeight: Infinity })]} spacing={4}>
          <Text
            modifiers={[
              font({ textStyle: "title2", weight: "semibold" }),
              multilineTextAlignment("center"),
            ]}
          >
            {albumName || " "}
          </Text>
          <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
            {artistName || " "}
          </Text>
        </VStack>
        {actions}
      </VStack>
    </Stack>
  );
}
