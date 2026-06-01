import { MediaItemExtras } from "@/shared/lib/player";
import { MediaItem } from "@rntp/player";
import { AlbumSong } from "../model/types";

type MapSongToMediaItemArgs = {
  song: AlbumSong;
  streamUrl: string;
  artworkUrl?: string;
};

export function mapSongToMediaItem({
  song,
  streamUrl,
  artworkUrl,
}: MapSongToMediaItemArgs): MediaItem {
  const extras: MediaItemExtras = {
    artistId: song.artistId,
    albumId: song.albumId,
  };

  return {
    mediaId: song.id,
    url: streamUrl,
    title: song.title,
    artist: song.artist,
    albumTitle: song.album,
    artworkUrl: artworkUrl,
    extras: extras as unknown as any,
  };
}
