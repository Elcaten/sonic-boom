import type { AlbumWithSongsID3, Child } from "subsonic-api";
import type { DownloadStatus } from "../downloads";

export type AlbumData = AlbumWithSongsID3;
export type AlbumSong = Child;

export type AlbumTrackRowModel = {
  id: string;
  title: string;
  trackNumber?: number;
  duration?: number;
  isPlayable: boolean;
  downloadStatus?: DownloadStatus;
};
