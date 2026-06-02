import { useRequiredQueries } from "@/api";
import TrackPlayer, { MediaItem, useActiveMediaItem, useIsPlaying } from "@rntp/player";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { mapSongToMediaItem, shuffleArray } from "./lib";
import { AlbumData, AlbumSong } from "./types";

export function useAlbum(albumId: string) {
  const queries = useRequiredQueries();
  const albumQuery = useQuery({
    ...queries.album(albumId),
    enabled: Boolean(albumId),
  });

  const album: AlbumData | undefined = albumQuery.data?.album;
  const songs: AlbumSong[] = album?.song ?? [];
  return { albumQuery, album, songs };
}

export function useAlbumMediaItems({ albumId, songs }: { albumId: string; songs: AlbumSong[] }) {
  const queries = useRequiredQueries();
  const albumArtworkUrlQuery = useQuery(queries.coverArtImage(albumId, 256));
  const streamUrlQueries = useQueries({
    queries: songs.map((song) => ({
      ...queries.streamUrl(song.id),
      select: (url: string) => ({ id: song.id, url }),
      enabled: songs.length > 0,
    })),
    combine: (queryResults) => {
      const entries = queryResults.flatMap((query) => {
        if (!query.data?.id || !query.data.url) return [];
        return [[query.data.id, query.data.url] as const];
      });
      return {
        data: new Map(entries),
        isPending: queryResults.some((query) => query.isPending),
      };
    },
  });

  const data = useMemo<MediaItem[]>(
    () =>
      songs.flatMap((song) => {
        const streamUrl = streamUrlQueries.data.get(song.id);
        if (!streamUrl) return [];
        return [
          mapSongToMediaItem({
            song,
            streamUrl,
            artworkUrl: albumArtworkUrlQuery.data?.uri,
          }),
        ];
      }),
    [albumArtworkUrlQuery.data?.uri, songs, streamUrlQueries.data],
  );

  return { isPending: albumArtworkUrlQuery.isPending || streamUrlQueries.isPending, data };
}

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
