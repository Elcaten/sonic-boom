import { Slider } from "@/components";
import { formatDuration } from "@/lib/format";
import { Host, Text } from "@expo/ui";
import { font, padding } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useProgress } from "@rntp/player";
import { useEffect, useState } from "react";

export function ProgressSlider() {
  const progress = useProgress();
  const [progressOptimistic, setProgressOptimistic] = useState<number>(progress.position);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressOptimistic(progress.position);
  }, [progress.position]);

  const onProgressChange = (value: number) => {
    setProgressOptimistic(value * progress.duration);
    TrackPlayer.seekTo(value * progress.duration);
  };

  return (
    <Slider
      progress={Boolean(progress.duration) ? progressOptimistic / progress.duration : 0}
      onProgressChange={onProgressChange}
      addonBottomLeft={({ isDragging, dragPercent }) => (
        <Host matchContents>
          <Text modifiers={[font({ textStyle: "callout" }), padding({ top: 8 })]}>
            {isDragging ? formatDuration(progress.duration * dragPercent) : formatDuration(progressOptimistic)}
          </Text>
        </Host>
      )}
      addonBottomRight={({ isDragging, dragPercent }) => (
        <Host matchContents>
          <Text modifiers={[font({ textStyle: "callout" }), padding({ top: 8 })]}>
            {isDragging
              ? `-${formatDuration(progress.duration * (1 - dragPercent))}`
              : `-${formatDuration(progress.duration - progressOptimistic)}`}
          </Text>
        </Host>
      )}
    />
  );
}
