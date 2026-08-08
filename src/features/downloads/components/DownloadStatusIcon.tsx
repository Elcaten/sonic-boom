import { Gauge, Image, ZStack } from "@expo/ui/swift-ui";
import { frame, gaugeStyle, scaleEffect, tint } from "@expo/ui/swift-ui/modifiers";
import { DownloadStatus } from "../types";

export function DownloadStatusIcon({ status }: { status: DownloadStatus }) {
  if (status.state === "downloaded") {
    return <Image systemName="arrow.down.circle.fill" size={18} color="#0A84FF" />;
  }

  if (status.state === "failed") {
    return <Image systemName="exclamationmark.triangle.fill" size={18} color="#FF9F0A" />;
  }

  return (
    <ZStack modifiers={[frame({ width: 20, height: 20 })]}>
      <Image systemName="arrow.down.circle" size={17} color="#0A84FF" />
      <Gauge
        value={status.progress}
        min={0}
        max={1}
        modifiers={[gaugeStyle("circularCapacity"), tint("#0A84FF"), scaleEffect(0.36)]}
      />
    </ZStack>
  );
}
