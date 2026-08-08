import type { AlbumSong } from "@/features/albums";
import {
  DownloadedTrackRef,
  DownloadStatus,
  DownloadTaskMap,
  getDownloadKey,
} from "../types";

export type AlbumDownloadCandidate = {
  id: string;
  songCount: number;
};

export function indexDownloadedTracks(tracks: DownloadedTrackRef[]): Map<string, DownloadedTrackRef> {
  return new Map(tracks.map((track) => [getDownloadKey(track), track]));
}

export function indexDownloadedAlbumsByArtist(
  tracks: DownloadedTrackRef[],
): Map<string, Set<string>> {
  const albumIdsByArtist = new Map<string, Set<string>>();

  for (const track of tracks) {
    const albumIds = albumIdsByArtist.get(track.albumArtistId) ?? new Set<string>();
    albumIds.add(track.albumId);
    albumIdsByArtist.set(track.albumArtistId, albumIds);
  }

  return albumIdsByArtist;
}

export function selectTrackDownloadStatuses({
  songs,
  albumId,
  downloadedTracks,
  tasks,
}: {
  songs: AlbumSong[];
  albumId?: string;
  downloadedTracks: DownloadedTrackRef[];
  tasks: DownloadTaskMap;
}): Map<string, DownloadStatus> {
  const statuses = new Map<string, DownloadStatus>();

  for (const song of songs) {
    const resolvedAlbumId = song.albumId ?? albumId;
    const downloadedTrack = downloadedTracks.find(
      (track) => track.albumId === resolvedAlbumId && track.trackId === song.id,
    );
    const task = [...tasks.values()].find(
      (candidate) => candidate.albumId === resolvedAlbumId && candidate.trackId === song.id,
    );

    if (downloadedTrack) {
      statuses.set(song.id, { state: "downloaded", progress: 1 });
    } else if (task?.status === "downloading") {
      statuses.set(song.id, { state: "downloading", progress: task.progress });
    } else if (task?.status === "failed") {
      statuses.set(song.id, { state: "failed", progress: task.progress });
    }
  }

  return statuses;
}

export function selectAlbumDownloadStatuses({
  albumArtistId,
  albums,
  downloadedTracks,
  tasks,
}: {
  albumArtistId: string;
  albums: AlbumDownloadCandidate[];
  downloadedTracks: DownloadedTrackRef[];
  tasks: DownloadTaskMap;
}): Map<string, DownloadStatus> {
  const statuses = new Map<string, DownloadStatus>();

  for (const album of albums) {
    const completedTrackIds = new Set(
      downloadedTracks
        .filter(
          (track) => track.albumArtistId === albumArtistId && track.albumId === album.id,
        )
        .map((track) => track.trackId),
    );
    const albumTasks = [...tasks.values()].filter(
      (task) =>
        task.albumArtistId === albumArtistId &&
        task.albumId === album.id &&
        !completedTrackIds.has(task.trackId),
    );
    const total = Math.max(album.songCount, completedTrackIds.size + albumTasks.length);
    if (total === 0) continue;

    const activeTasks = albumTasks.filter((task) => task.status === "downloading");
    const failedTasks = albumTasks.filter((task) => task.status === "failed");
    const progress = Math.min(
      1,
      (completedTrackIds.size + activeTasks.reduce((sum, task) => sum + task.progress, 0)) / total,
    );

    if (completedTrackIds.size >= total) {
      statuses.set(album.id, { state: "downloaded", progress: 1 });
    } else if (activeTasks.length > 0) {
      statuses.set(album.id, { state: "downloading", progress });
    } else if (failedTasks.length > 0) {
      statuses.set(album.id, { state: "failed", progress });
    } else if (completedTrackIds.size > 0) {
      statuses.set(album.id, { state: "partial", progress });
    }
  }

  return statuses;
}

export function canStartAlbumDownload(status: DownloadStatus | undefined): boolean {
  return status?.state !== "downloading" && status?.state !== "downloaded";
}
