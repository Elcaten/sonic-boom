import { Button, HStack, Image, Text } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, padding } from "@expo/ui/swift-ui/modifiers";

export function AlbumPlaybackActions({
  onPlayPress,
  onShufflePress,
}: {
  onPlayPress: () => void;
  onShufflePress: () => void;
}) {
  return (
    <HStack spacing={12} modifiers={[padding({ bottom: 6 })]}>
      <Button modifiers={[buttonStyle("bordered"), controlSize("large")]} onPress={onPlayPress}>
        <HStack modifiers={[frame({ maxWidth: Infinity })]} spacing={8}>
          <Image systemName="play.fill" size={18} />
          <Text>Play</Text>
        </HStack>
      </Button>
      <Button modifiers={[buttonStyle("bordered"), controlSize("large")]} onPress={onShufflePress}>
        <HStack modifiers={[frame({ maxWidth: Infinity })]} spacing={8}>
          <Image systemName="shuffle" size={18} />
          <Text>Shuffle</Text>
        </HStack>
      </Button>
    </HStack>
  );
}
