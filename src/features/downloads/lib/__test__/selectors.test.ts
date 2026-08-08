import type { AlbumSong } from "@/features/albums";
import type { DownloadedTrackRef, DownloadTaskMap } from "../../types";
import { getDownloadKey } from "../../types";
import {
  canStartAlbumDownload,
  indexDownloadedAlbumsByArtist,
  selectAlbumDownloadStatuses,
  selectTrackDownloadStatuses,
} from "../selectors";

const song = (id: string): AlbumSong =>
  ({ id, title: id, isDir: false, artistId: "artist", albumId: "album" }) as AlbumSong;

const downloaded = (trackId: string): DownloadedTrackRef => ({
  albumArtistId: "artist",
  albumId: "album",
  trackId,
  fileUri: `file:///downloads/${trackId}.mp3`,
});

describe("download selectors", () => {
  it("prefers a completed file over stale task state", () => {
    const tasks: DownloadTaskMap = new Map();
    const identity = { albumArtistId: "artist", albumId: "album", trackId: "one" };
    tasks.set(getDownloadKey(identity), {
      ...identity,
      status: "failed",
      progress: 0.4,
      errorMessage: "offline",
    });

    const statuses = selectTrackDownloadStatuses({
      songs: [song("one")],
      downloadedTracks: [downloaded("one")],
      tasks,
    });

    expect(statuses.get("one")).toEqual({ state: "downloaded", progress: 1 });
  });

  it("combines completed files and active progress for an album", () => {
    const tasks: DownloadTaskMap = new Map();
    const identity = { albumArtistId: "artist", albumId: "album", trackId: "two" };
    tasks.set(getDownloadKey(identity), {
      ...identity,
      status: "downloading",
      progress: 0.5,
    });

    const statuses = selectAlbumDownloadStatuses({
      albumArtistId: "artist",
      albums: [{ id: "album", songCount: 3 }],
      downloadedTracks: [downloaded("one")],
      tasks,
    });

    expect(statuses.get("album")).toEqual({ state: "downloading", progress: 0.5 });
    expect(canStartAlbumDownload(statuses.get("album"))).toBe(false);
  });

  it("marks incomplete albums as retryable", () => {
    const statuses = selectAlbumDownloadStatuses({
      albumArtistId: "artist",
      albums: [{ id: "album", songCount: 2 }],
      downloadedTracks: [downloaded("one")],
      tasks: new Map(),
    });

    expect(statuses.get("album")).toEqual({ state: "partial", progress: 0.5 });
    expect(canStartAlbumDownload(statuses.get("album"))).toBe(true);
  });

  it("indexes unique downloaded albums under their album artist", () => {
    const albumsByArtist = indexDownloadedAlbumsByArtist([
      downloaded("one"),
      downloaded("two"),
      {
        albumArtistId: "other-artist",
        albumId: "other-album",
        trackId: "three",
        fileUri: "file:///downloads/three.mp3",
      },
    ]);

    expect(albumsByArtist.get("artist")).toEqual(new Set(["album"]));
    expect(albumsByArtist.get("other-artist")).toEqual(new Set(["other-album"]));
  });
});
