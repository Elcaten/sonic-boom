import {
  selectTrackDownloadStatuses,
  useDownloadedTracks,
  useDownloadStore,
  useStartMediaDownload,
} from "@/features/downloads";
import { useRequiredQueries } from "@/shared/api";
import TrackPlayer, { MediaItem, useActiveMediaItem, useIsPlaying } from "@rntp/player";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { mapSongToMediaItem, shuffleArray } from "./lib";
import { AlbumData, AlbumSong, AlbumTrackRowModel } from "./types";

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
  const downloadedTracksQuery = useDownloadedTracks();
  const downloadTasks = useDownloadStore((state) => state.tasks);
  const albumArtworkUrlQuery = useQuery(queries.coverArtImage(albumId, 256));
  const downloadedByTrackId = useMemo(
    () =>
      new Map(
        (downloadedTracksQuery.data ?? [])
          .filter((track) => track.albumId === albumId)
          .map((track) => [track.trackId, track] as const),
      ),
    [albumId, downloadedTracksQuery.data],
  );
  const streamUrlQueries = useQueries({
    queries: songs.map((song) => ({
      ...queries.streamUrl(song.id),
      select: (url: string) => ({ id: song.id, url }),
      enabled:
        !downloadedTracksQuery.isPending &&
        !downloadedByTrackId.has(song.id),
    })),
    combine: (queryResults) => {
      const entries = queryResults.flatMap((query) => {
        if (!query.data?.id || !query.data.url) return [];
        return [[query.data.id, query.data.url] as const];
      });
      return {
        data: new Map(entries),
        isPending: queryResults.some((query) => query.isLoading),
      };
    },
  });

  const downloadStatuses = useMemo(
    () =>
      selectTrackDownloadStatuses({
        songs,
        albumId,
        downloadedTracks: downloadedTracksQuery.data ?? [],
        tasks: downloadTasks,
      }),
    [albumId, downloadTasks, downloadedTracksQuery.data, songs],
  );

  const data = useMemo<MediaItem[]>(
    () =>
      songs.flatMap((song) => {
        const mediaUrl =
          downloadedByTrackId.get(song.id)?.fileUri ?? streamUrlQueries.data.get(song.id);
        if (!mediaUrl) return [];
        return [
          mapSongToMediaItem({
            song,
            mediaUrl,
            artworkUrl: albumArtworkUrlQuery.data?.uri,
          }),
        ];
      }),
    [albumArtworkUrlQuery.data?.uri, downloadedByTrackId, songs, streamUrlQueries.data],
  );

  const tracks = useMemo<AlbumTrackRowModel[]>(
    () =>
      songs.map((song) => ({
        id: song.id,
        title: song.title,
        trackNumber: song.track,
        duration: song.duration,
        isPlayable: data.some((mediaItem) => mediaItem.mediaId === song.id),
        downloadStatus: downloadStatuses.get(song.id),
      })),
    [data, downloadStatuses, songs],
  );

  return {
    isPending:
      downloadedTracksQuery.isPending ||
      albumArtworkUrlQuery.isPending ||
      streamUrlQueries.isPending,
    data,
    tracks,
  };
}

export function useDownloadAlbum() {
  const queryClient = useQueryClient();
  const queries = useRequiredQueries();
  const startMediaDownload = useStartMediaDownload();

  return useCallback(
    async ({ albumId }: { albumId: string }) => {
      const response = await queryClient.ensureQueryData(queries.album(albumId));
      const songs = response.album.song ?? [];

      await Promise.allSettled(
        songs.map(async (song) => {
          const target = {
            artistId: song.artistId ?? response.album.artistId ?? "",
            albumId: song.albumId ?? albumId,
            trackId: song.id,
            contentType: song.contentType,
          };

          try {
            const remoteUrl = await queryClient.ensureQueryData(queries.streamUrl(song.id));
            startMediaDownload(target, remoteUrl);
          } catch (error) {
            useDownloadStore
              .getState()
              .failTask(target, error instanceof Error ? error.message : String(error));
          }
        }),
      );
    },
    [queries, queryClient, startMediaDownload],
  );
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
