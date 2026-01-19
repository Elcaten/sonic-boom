import { PropsWithChildren, useEffect, useRef } from "react";
import { LayoutChangeEvent, PanResponder, View } from "react-native";

const clamp = (v: number) => Math.max(0, Math.min(1, v));

type PanSexualProps = {
  onDragStart?: (percent: number) => void;
  onDrag?: (percent: number) => void; // 0..1
  onDragEnd?: (percent: number) => void;
};

export function DragTracker(props: PropsWithChildren<PanSexualProps>) {
  const width = useRef(0);

  const onDragStart = useRef(props.onDragStart);
  const onDrag = useRef(props.onDrag);
  const onDragEnd = useRef(props.onDragEnd);

  useEffect(() => {
    onDragStart.current = props.onDragStart;
    onDrag.current = props.onDrag;
    onDragEnd.current = props.onDragEnd;
  }, [props.onDragStart, props.onDrag, props.onDragEnd]);

  const onLayout = (event: LayoutChangeEvent) => {
    width.current = event.nativeEvent.layout.width;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderGrant: (evt) => {
        if (!width.current) {
          return;
        }

        const percent = clamp(evt.nativeEvent.locationX / width.current);
        onDragStart.current?.(percent);
      },

      onPanResponderMove: (evt) => {
        if (!width.current) {
          return;
        }

        const percent = clamp(evt.nativeEvent.locationX / width.current);
        onDrag.current?.(percent);
      },

      onPanResponderRelease: (evt) => {
        if (!width.current) {
          return;
        }

        const percent = clamp(evt.nativeEvent.locationX / width.current);
        onDragEnd.current?.(percent);
      },
    })
  ).current;

  return (
    <View onLayout={onLayout} {...panResponder.panHandlers}>
      {props.children}
    </View>
  );
}
