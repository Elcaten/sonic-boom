import { usePlayerQueue } from "@/track-player/use-player-queue";
import { Host, List, Text, VStack } from "@expo/ui/swift-ui";
import TrackPlayer, { useActiveTrack } from "react-native-track-player";

export default function ActiveTrackModal() {
  const activeTrack = useActiveTrack();
  const { queue } = usePlayerQueue();

  const handlePress = (index: number) => {
    const item = queue[index];
    if (item.id === activeTrack?.id) {
      TrackPlayer.play();
    } else {
      TrackPlayer.skip(index);
    }
  };

  const handleMoveItem = async (fromIndex: number, toIndex: number) => {
    const savedActiveTrack = await TrackPlayer.getActiveTrack();
    const savedProgress = await TrackPlayer.getProgress();

    const queue = await TrackPlayer.getQueue();
    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    TrackPlayer.setQueue(newQueue);

    const indexToSkipTo = newQueue.findIndex((item) => item.id === savedActiveTrack?.id);
    if (indexToSkipTo !== -1) {
      TrackPlayer.skip(indexToSkipTo, savedProgress.position);
    }
    TrackPlayer.play();
  };

  const handleDeleteItem = async (index: number) => {
    const savedActiveTrack = await TrackPlayer.getActiveTrack();
    const savedProgress = await TrackPlayer.getProgress();

    const queue = await TrackPlayer.getQueue();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    TrackPlayer.setQueue(newQueue);

    const indexToSkipTo = newQueue.findIndex((item) => item.id === savedActiveTrack?.id);
    if (indexToSkipTo !== -1) {
      TrackPlayer.skip(indexToSkipTo, savedProgress.position);
    }
    TrackPlayer.play();
  };

  return (
    <Host style={{ flex: 1 }}>
      <List
        listStyle="inset"
        moveEnabled
        onMoveItem={handleMoveItem}
        deleteEnabled
        onDeleteItem={handleDeleteItem}
      >
        {queue.map((item, index) => (
          <VStack key={item.id} onPress={() => handlePress(index)} alignment="leading">
            <Text weight={item.id === activeTrack?.id ? "semibold" : "regular"}>{item.title!}</Text>
          </VStack>
        ))}
      </List>
    </Host>
  );
}
