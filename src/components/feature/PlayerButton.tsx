import { Button } from "@expo/ui";
import { Image } from "@expo/ui/swift-ui";
import { controlSize } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useIsPlaying } from "@rntp/player";

export const PlayerButton = {
  Previous: PreviousButton,
  PlayPause: PlayPauseButton,
  Next: NextButton,
};

function PreviousButton({ size }: { size: 32 | 48 }) {
  return (
    <Button modifiers={[controlSize("large")]} onPress={() => TrackPlayer.skipToPrevious()}>
      <Image systemName="backward.fill" color="primary" size={size} />
    </Button>
  );
}

function PlayPauseButton({ size }: { size: 32 | 48 }) {
  const isPlaying = useIsPlaying();

  return (
    <Button
      modifiers={[controlSize("large")]}
      onPress={() => (isPlaying ? TrackPlayer.pause() : TrackPlayer.play())}
    >
      <Image systemName={isPlaying ? "pause.fill" : "play.fill"} color="primary" size={size} />
    </Button>
  );
}

function NextButton({ size }: { size: 32 | 48 }) {
  return (
    <Button modifiers={[controlSize("large")]} onPress={() => TrackPlayer.skipToNext()}>
      <Image systemName="forward.fill" color="primary" size={size} />
    </Button>
  );
}
