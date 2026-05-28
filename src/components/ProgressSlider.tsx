import { formatDuration } from "@/utils/formatd-duration";
import { Host, Text } from "@expo/ui";
import { font } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useProgress } from "@rntp/player";
import { useEffect, useState } from "react";
import { Slider } from "./ui/slider/slider";

export function ProgressSlider() {
  const progress = useProgress();

  const onProgressChange = (value: number) => {
    setProgressOptimistic(value * progress.duration);
    TrackPlayer.seekTo(value * progress.duration);
  };

  const [progressOptimistic, setProgressOptimistic] = useState<number>(progress.position);

  useEffect(() => {
    setProgressOptimistic(progress.position);
  }, [progress.position]);

  return (
    <Slider
      progress={Boolean(progress.duration) ? progressOptimistic / progress.duration : 0}
      onProgressChange={onProgressChange}
      addonBottomLeft={({ isDragging, dragPercent }) => (
        <Host matchContents>
          <Text modifiers={[font({ textStyle: "callout" })]}>
            {isDragging
              ? formatDuration(progress.duration * dragPercent)
              : formatDuration(progressOptimistic)}
          </Text>
        </Host>
      )}
      addonBottomRight={({ isDragging, dragPercent }) => (
        <Host matchContents>
          <Text modifiers={[font({ textStyle: "callout" })]}>
            {isDragging
              ? `-${formatDuration(progress.duration * (1 - dragPercent))}`
              : `-${formatDuration(progress.duration - progressOptimistic)}`}
          </Text>
        </Host>
      )}
    />
  );
}
