import { Button, Image } from "@expo/ui/swift-ui";
import { controlSize } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useIsPlaying } from "@rntp/player";
import { ColorValue } from "react-native";

export const PlayerButton = {
  Previous: PreviousButton,
  PlayPause: PlayPauseButton,
  Next: NextButton,
};

type PlayerButtonSize = 16 | 24 | 32 | 48;
type PlayerButtonProps = {
  size: PlayerButtonSize;
  color?: ColorValue;
};

function PreviousButton({ size, color = "primary" }: PlayerButtonProps) {
  return (
    <Button modifiers={[controlSize("large")]} onPress={() => TrackPlayer.skipToPrevious()}>
      <Image systemName="backward.fill" color={color} size={size} />
    </Button>
  );
}

function PlayPauseButton({ size, color = "primary" }: PlayerButtonProps) {
  const isPlaying = useIsPlaying();
  return (
    <Button
      modifiers={[controlSize("large")]}
      onPress={() => (isPlaying ? TrackPlayer.pause() : TrackPlayer.play())}
    >
      <Image systemName={isPlaying ? "pause.fill" : "play.fill"} color={color} size={size} />
    </Button>
  );
}

function NextButton({ size, color = "primary" }: PlayerButtonProps) {
  return (
    <Button modifiers={[controlSize("large")]} onPress={() => TrackPlayer.skipToNext()}>
      <Image systemName="forward.fill" color={color} size={size} />
    </Button>
  );
}
