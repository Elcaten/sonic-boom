import { MyDownloadTask } from "@/features/downloads";
import { Gauge, Image, ZStack } from "@expo/ui/swift-ui";
import {
  Animation,
  animation,
  frame,
  gaugeStyle,
  scaleEffect,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { SFSymbol } from "expo-symbols";

export function DownloadStatusIcon({ downloadTask }: { downloadTask: MyDownloadTask }) {
  const sfSymbol = (
    {
      error: "warninglight",
      loading: "arrow.down.circle",
      success: "arrow.down.circle.fill",
      idle: "circle",
    } satisfies Record<MyDownloadTask["status"], SFSymbol>
  )[downloadTask.status];
  return (
    <ZStack modifiers={[frame({ width: 18, height: 18 })]}>
      <Image systemName={sfSymbol} size={16} color={"#0A84FF"} />

      {downloadTask.status === "loading" && (
        <Gauge
          value={downloadTask.progress ?? 0.5}
          min={0}
          max={1}
          modifiers={[
            gaugeStyle("circularCapacity"),
            tint("#0A84FF"),
            scaleEffect(0.33),
            animation(Animation.linear({ duration: 0.25 }), downloadTask.progress),
          ]}
        ></Gauge>
      )}
    </ZStack>
  );
}
