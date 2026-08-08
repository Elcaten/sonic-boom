import type { AlbumData } from "@/features/albums";
import type { DownloadedTrackRef } from "@/features/downloads";
import { formatDuration } from "@/shared/lib/format";

export type DownloadedSongRow = {
  id: string;
  title: string;
  detail: string;
  albumTitle: string;
  discNumber: number;
  trackNumber: number;
};

export type DownloadArtistSection = {
  artistId: string;
  title: string;
  songs: DownloadedSongRow[];
};

export function buildDownloadsSections({
  downloadedTracks,
  artistNames,
  albums,
}: {
  downloadedTracks: DownloadedTrackRef[];
  artistNames: Map<string, string>;
  albums: Map<string, AlbumData>;
}): DownloadArtistSection[] {
  const sectionsByArtist = new Map<string, DownloadArtistSection>();

  for (const downloadedTrack of downloadedTracks) {
    const album = albums.get(downloadedTrack.albumId);
    const song = album?.song?.find((candidate) => candidate.id === downloadedTrack.trackId);
    const artistTitle =
      artistNames.get(downloadedTrack.albumArtistId) ??
      album?.artist ??
      song?.artist ??
      "Unknown artist";
    const albumTitle = album?.name ?? song?.album ?? "Unknown album";
    const trackNumber = song?.track ?? Number.MAX_SAFE_INTEGER;
    const detail = [
      albumTitle,
      song?.track ? `Track ${song.track}` : null,
      song?.duration ? formatDuration(song.duration) : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const section = sectionsByArtist.get(downloadedTrack.albumArtistId) ?? {
      artistId: downloadedTrack.albumArtistId,
      title: artistTitle,
      songs: [],
    };

    section.songs.push({
      id: downloadedTrack.trackId,
      title: song?.title ?? `Track ${downloadedTrack.trackId}`,
      detail,
      albumTitle,
      discNumber: song?.discNumber ?? 1,
      trackNumber,
    });
    sectionsByArtist.set(downloadedTrack.albumArtistId, section);
  }

  return [...sectionsByArtist.values()]
    .map((section) => ({
      ...section,
      songs: section.songs.sort(
        (a, b) =>
          a.albumTitle.localeCompare(b.albumTitle) ||
          a.discNumber - b.discNumber ||
          a.trackNumber - b.trackNumber ||
          a.title.localeCompare(b.title),
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
