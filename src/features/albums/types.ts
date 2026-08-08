import type { AlbumWithSongsID3, Child } from "subsonic-api";

export type AlbumData = AlbumWithSongsID3;
export type AlbumSong = Child;
export type DownloadedMedia = { trackId: string; downloadedFileUrl: string | undefined };
