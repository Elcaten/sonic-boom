import { shuffleArray } from "@/features/album-playback/lib/shuffle-array";
import TrackPlayer, { MediaItem } from "@rntp/player";

type UseAlbumPlaybackArgs = {
  tracks: MediaItem[];
};

export function useAlbumPlayback({ tracks }: UseAlbumPlaybackArgs) {
  const playAlbum = () => {
    if (!tracks.length) {
      return;
    }

    TrackPlayer.setMediaItems(tracks);
    TrackPlayer.play();
  };

  const shuffleAlbum = () => {
    if (!tracks.length) {
      return;
    }

    const shuffledTracks = shuffleArray(tracks);
    TrackPlayer.setMediaItems(shuffledTracks);
    TrackPlayer.play();
  };

  const playFromTrack = (trackId: string) => {
    if (!tracks.length) {
      return;
    }

    const startIndex = tracks.findIndex((track) => track.mediaId === trackId);
    if (startIndex < 0) {
      return;
    }

    TrackPlayer.setMediaItems(tracks, startIndex);
  };

  return {
    playAlbum,
    shuffleAlbum,
    playFromTrack,
  };
}
