import { useColors } from "@/context/app-context";
import { formatDuration } from "@/utils/formatDuration";
import TrackPlayer, { useProgress } from "@rntp/player";
import { Fragment, useEffect, useState } from "react";
import { ThemedText } from "./themed/themed-text";
import { Slider } from "./ui/slider/slider";

export function ProgressSlider() {
  const colors = useColors();

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
        <ThemedText
          style={{
            fontSize: 13,
            color: colors.label,
          }}
        >
          {isDragging
            ? formatDuration(progress.duration * dragPercent)
            : formatDuration(progressOptimistic)}
        </ThemedText>
      )}
      addonBottomRight={({ isDragging, dragPercent }) => (
        <ThemedText
          style={{
            fontSize: 13,
            color: colors.label,
          }}
        >
          {isDragging ? (
            <Fragment>-{formatDuration(progress.duration * (1 - dragPercent))}</Fragment>
          ) : (
            <Fragment>-{formatDuration(progress.duration - progressOptimistic)}</Fragment>
          )}
        </ThemedText>
      )}
    />
  );
}
