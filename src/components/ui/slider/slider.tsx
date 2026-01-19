import { useColors } from "@/context/app-context";
import React, { useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, useColorScheme } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { DragTracker } from "./drag-tracker";

type SliderProps = {
  /** 0..1 */
  progress: number;
  onProgressChange: (progress: number) => void;
  addonLeft?: React.ReactNode;
  addonRight?: React.ReactNode;
  addonBottomLeft?: ({ isDragging }: { isDragging: boolean }) => React.ReactNode;
  addonBottomRight?: ({ isDragging }: { isDragging: boolean }) => React.ReactNode;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const useSliderColors = () => {
  const colors = useColors();
  const theme = useColorScheme() ?? "light";
  return {
    background: theme === "light" ? colors.systemGray5 : colors.systemGray4,
    foregroundActive: theme === "light" ? colors.black : colors.white,
    foregroundInactive: theme === "light" ? colors.systemGray : colors.systemGray2,
  };
};

export function Slider(props: SliderProps) {
  const { progress, onProgressChange, addonLeft, addonRight, addonBottomLeft, addonBottomRight } =
    props;
  const { background, foregroundActive, foregroundInactive } = useSliderColors();

  const scaleAnim = useRef(new Animated.ValueXY({ x: 1, y: 1 })).current;
  const inverseScaleX = scaleAnim.x.interpolate({
    inputRange: [1, 1.05],
    outputRange: [1, 1 / 1.05], // ≈ 0.952
  });
  const inverseScaleY = scaleAnim.y.interpolate({
    inputRange: [1, 2],
    outputRange: [1, 0.5], // 1/2
  });
  const translateYAnim = scaleAnim.y.interpolate({
    inputRange: [1, 2],
    outputRange: [0, 10],
  });

  const handlePressIn = () => {
    setIsDragging(true);
    Animated.timing(scaleAnim, {
      toValue: { x: 1.05, y: 2 },
      duration: 150,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start();
  };

  const handlePressOut = (progress: number) => {
    setIsDragging(false);
    Animated.spring(scaleAnim, {
      toValue: { x: 1, y: 1 },
      stiffness: 90,
      useNativeDriver: true,
    }).start();
    onProgressChange(progress);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);

  const barWidth = isDragging ? dragPercent : progress;

  const [containerWidth, setContainerWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

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
            rx={scaleAnim.x.interpolate({
              inputRange: [1, 1.05],
              outputRange: [4, 4 * 2],
            })}
            ry={scaleAnim.y.interpolate({
              inputRange: [1, 2],
              outputRange: [4, 4 * 2],
            })}
            fill={background}
          />
          <AnimatedRect
            x="0"
            y="0"
            width={barWidth * containerWidth}
            height={8}
            rx={scaleAnim.x.interpolate({
              inputRange: [1, 1.05],
              outputRange: [4, 4 * 2],
            })}
            ry={scaleAnim.y.interpolate({
              inputRange: [1, 2],
              outputRange: [4, 4 * 2],
            })}
            fill={isDragging ? foregroundActive : foregroundInactive}
          />
        </Svg>
      </Animated.View>
      <Animated.View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          transform: [{ scaleX: scaleAnim.x }, { scaleY: scaleAnim.y }],
        }}
      >
        <Animated.View
          style={{
            transform: [
              { scaleX: inverseScaleX },
              { scaleY: inverseScaleY },
              { translateY: translateYAnim },
            ],
          }}
        >
          {addonBottomLeft?.({ isDragging })}
        </Animated.View>
        <Animated.View
          style={{
            transform: [
              { scaleX: inverseScaleX },
              { scaleY: inverseScaleY },
              { translateY: translateYAnim },
            ],
          }}
        >
          {addonBottomRight?.({ isDragging })}
        </Animated.View>
      </Animated.View>
    </DragTracker>
  );
}
