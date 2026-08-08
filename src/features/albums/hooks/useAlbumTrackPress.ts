import TrackPlayer, { MediaItem, useActiveMediaItem, useIsPlaying } from "@rntp/player";

export function useAlbumTrackPress({
  tracks,
  onInactiveTrackPress,
}: {
  tracks: MediaItem[];
  onInactiveTrackPress: (trackId: string) => void;
}) {
  const isPlaying = useIsPlaying();
  const activeTrack = useActiveMediaItem();

  const handleTrackPress = (trackId: string) => {
    if (!tracks.length) return;
    if (trackId === activeTrack?.mediaId) {
      if (isPlaying) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
      return;
    }
    onInactiveTrackPress(trackId);
  };

  return {
    isPlaying,
    activeTrackId: activeTrack?.mediaId,
    handleTrackPress,
  };
}
