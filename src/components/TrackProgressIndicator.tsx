import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const TrackProgressIndicator = ({
  isPlaying,
  progress,
}: {
  isPlaying: boolean;
  progress: number;
}) => {
  const radius = 12;
  const strokeWidth = 2;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const tintColor = useThemeColor({}, "tint");

  const progressShared = useSharedValue(0);

  useEffect(() => {
    progressShared.value = withTiming(progress, {
      duration: 40,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - progressShared.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={radius * 2} height={radius * 2} style={styles.svgRotate}>
        {/* Background circle */}
        <Circle
          stroke="#e5e5e5"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <Circle
          stroke={tintColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          strokeDashoffset={
            circumference - progressShared.value * circumference
          }
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </Svg>
      {/* Icon */}
      <Ionicons
        name={isPlaying ? "pause-sharp" : "play-sharp"}
        color={tintColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  svgRotate: {
    transform: [{ rotate: "-90deg" }],
    position: "absolute",
  },
});
