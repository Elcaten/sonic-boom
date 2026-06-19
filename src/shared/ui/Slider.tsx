import { colors, useColorScheme } from "@/shared/theme";
import React, { useState } from "react";
import { Animated, Easing, LayoutChangeEvent, useAnimatedValueXY } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { DragTracker } from "./DragTracker";

type SliderProps = {
  progress: number;
  onProgressChange: (progress: number) => void;
  addonBottomLeft?: ({
    isDragging,
    dragPercent,
  }: {
    isDragging: boolean;
    dragPercent: number;
  }) => React.ReactNode;
  addonBottomRight?: ({
    isDragging,
    dragPercent,
  }: {
    isDragging: boolean;
    dragPercent: number;
  }) => React.ReactNode;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const useSliderColors = () => {
  const theme = useColorScheme() ?? "light";
  return {
    background: theme === "light" ? colors.systemGray5 : colors.systemGray4,
    foregroundActive: theme === "light" ? colors.black : colors.white,
    foregroundInactive: theme === "light" ? colors.systemGray : colors.systemGray2,
  };
};

export function Slider(props: SliderProps) {
  const { progress, onProgressChange, addonBottomLeft, addonBottomRight } = props;
  const { background, foregroundActive, foregroundInactive } = useSliderColors();
  const scaleAnim = useAnimatedValueXY({ x: 1, y: 1 });

  const inverseScaleX = scaleAnim.x.interpolate({
    inputRange: [1, 1.05],
    outputRange: [1, 1 / 1.05],
  });
  const translateYAnim = scaleAnim.y.interpolate({
    inputRange: [1, 2],
    outputRange: [0, 10],
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handlePressIn = () => {
    setIsDragging(true);
    Animated.timing(scaleAnim, {
      toValue: { x: 1.05, y: 2 },
      duration: 150,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start();
  };

  const handlePressOut = (nextProgress: number) => {
    setIsDragging(false);
    Animated.spring(scaleAnim, {
      toValue: { x: 1, y: 1 },
      stiffness: 90,
      useNativeDriver: true,
    }).start();
    onProgressChange(nextProgress);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const barWidth = isDragging ? dragPercent : progress;

  return (
    <DragTracker
      onDragStart={handlePressIn}
      onDrag={(percent) => setDragPercent(percent)}
      onDragEnd={handlePressOut}
    >
      <Animated.View
        onLayout={onLayout}
        style={{
          flexDirection: "row",
          transform: [{ scaleX: scaleAnim.x }, { scaleY: scaleAnim.y }],
        }}
      >
        <Svg width={containerWidth} height={8}>
          <AnimatedRect
            x="0"
            y="0"
            width={containerWidth}
            height={8}
            rx={scaleAnim.x.interpolate({ inputRange: [1, 1.05], outputRange: [4, 8] })}
            ry={scaleAnim.y.interpolate({ inputRange: [1, 2], outputRange: [4, 8] })}
            fill={background}
          />
          <AnimatedRect
            x="0"
            y="0"
            width={barWidth * containerWidth}
            height={8}
            rx={scaleAnim.x.interpolate({ inputRange: [1, 1.05], outputRange: [4, 8] })}
            ry={scaleAnim.y.interpolate({ inputRange: [1, 2], outputRange: [4, 8] })}
            fill={isDragging ? foregroundActive : foregroundInactive}
          />
        </Svg>
      </Animated.View>
      <Animated.View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          transform: [{ scaleX: scaleAnim.x }],
        }}
      >
        <Animated.View
          style={{ transform: [{ scaleX: inverseScaleX }, { translateY: translateYAnim }] }}
        >
          {addonBottomLeft?.({ isDragging, dragPercent })}
        </Animated.View>
        <Animated.View
          style={{ transform: [{ scaleX: inverseScaleX }, { translateY: translateYAnim }] }}
        >
          {addonBottomRight?.({ isDragging, dragPercent })}
        </Animated.View>
      </Animated.View>
    </DragTracker>
  );
}
