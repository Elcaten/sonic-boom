import { usePlayerQueue } from "@/track-player/use-player-queue";
import { Button, Host, List, Text } from "@expo/ui/swift-ui";
import { font, listStyle } from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useActiveMediaItem } from "@rntp/player";

export default function ActiveTrackModal() {
  const activeTrack = useActiveMediaItem();
  const { queue } = usePlayerQueue();

  const handlePress = (index: number) => {
    const item = queue[index];
    if (item.mediaId === activeTrack?.mediaId) {
      TrackPlayer.play();
    } else {
      TrackPlayer.skipToIndex(index);
    }
  };

  const handleMoveItem = async (fromIndex: number, toIndex: number) => {
    const savedActiveTrack = TrackPlayer.getActiveMediaItem();
    const savedProgress = TrackPlayer.getProgress();

    const queue = TrackPlayer.getQueue();
    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    TrackPlayer.setMediaItems(newQueue);

    const indexToSkipTo = newQueue.findIndex((item) => item.mediaId === savedActiveTrack?.mediaId);
    if (indexToSkipTo !== -1) {
      TrackPlayer.skipToIndex(indexToSkipTo);
      TrackPlayer.seekTo(savedProgress.position);
    }
    TrackPlayer.play();
  };

  const handleDeleteItem = async (index: number) => {
    const savedActiveTrack = TrackPlayer.getActiveMediaItem();
    const savedProgress = TrackPlayer.getProgress();

    const queue = TrackPlayer.getQueue();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    TrackPlayer.setMediaItems(newQueue);

    const indexToSkipTo = newQueue.findIndex((item) => item.mediaId === savedActiveTrack?.mediaId);
    if (indexToSkipTo !== -1) {
      TrackPlayer.skipToIndex(indexToSkipTo);
      TrackPlayer.seekTo(savedProgress.position);
    }
    TrackPlayer.play();
  };

  return (
    <Host style={{ flex: 1 }}>
      <List
        modifiers={[listStyle("inset")]}
        // TODO: add move and delete functionality
        // moveEnabled
        // onMoveItem={handleMoveItem}
        // deleteEnabled
        // onDeleteItem={handleDeleteItem}
      >
        {queue.map((item, index) => (
          <Button key={item.mediaId} onPress={() => handlePress(index)}>
            <Text
              modifiers={[
                font({ weight: item.mediaId === activeTrack?.mediaId ? "semibold" : "regular" }),
              ]}
            >
              {item.title!}
            </Text>
          </Button>
        ))}
      </List>
    </Host>
  );
}
