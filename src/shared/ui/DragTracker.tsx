/* eslint-disable react-hooks/refs */
import { PropsWithChildren, useEffect, useRef } from "react";
import { LayoutChangeEvent, PanResponder, View } from "react-native";

const clamp = (v: number) => Math.max(0, Math.min(1, v));

type DragTrackerProps = {
  onDragStart?: (percent: number) => void;
  onDrag?: (percent: number) => void;
  onDragEnd?: (percent: number) => void;
};

export function DragTracker(props: PropsWithChildren<DragTrackerProps>) {
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
        if (!width.current) return;
        onDragStart.current?.(clamp(evt.nativeEvent.locationX / width.current));
      },
      onPanResponderMove: (evt) => {
        if (!width.current) return;
        onDrag.current?.(clamp(evt.nativeEvent.locationX / width.current));
      },
      onPanResponderRelease: (evt) => {
        if (!width.current) return;
        onDragEnd.current?.(clamp(evt.nativeEvent.locationX / width.current));
      },
    }),
  ).current;

  return (
    <View onLayout={onLayout} {...panResponder.panHandlers}>
      {props.children}
    </View>
  );
}
