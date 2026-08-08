import TrackPlayer, { MediaItem } from "@rntp/player";
import { shuffleArray } from "../lib";

export function useAlbumPlayback({ tracks }: { tracks: MediaItem[] }) {
  const playAlbum = () => {
    if (!tracks.length) return;
    TrackPlayer.setMediaItems(tracks);
    TrackPlayer.play();
  };

  const shuffleAlbum = () => {
    if (!tracks.length) return;
    TrackPlayer.setMediaItems(shuffleArray(tracks));
    TrackPlayer.play();
  };

  const playFromTrack = (trackId: string) => {
    if (!tracks.length) return;
    const startIndex = tracks.findIndex((track) => track.mediaId === trackId);
    if (startIndex < 0) return;
    TrackPlayer.setMediaItems(tracks, startIndex);
  };

  return { playAlbum, shuffleAlbum, playFromTrack };
}
