import type { AlbumData } from "@/features/albums";
import { buildDownloadsSections } from "../downloads-sections";

describe("buildDownloadsSections", () => {
  it("groups by artist and sorts songs by album, disc, and track", () => {
    const album = {
      id: "album",
      name: "Album A",
      artist: "Artist B",
      song: [
        { id: "two", title: "Second", isDir: false, track: 2, duration: 62 },
        { id: "one", title: "First", isDir: false, track: 1, duration: 61 },
      ],
    } as AlbumData;

    const sections = buildDownloadsSections({
      downloadedTracks: [
        { artistId: "artist", albumId: "album", trackId: "two", fileUri: "file:///two" },
        { artistId: "artist", albumId: "album", trackId: "one", fileUri: "file:///one" },
      ],
      artistNames: new Map([["artist", "Artist B"]]),
      albums: new Map([["album", album]]),
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Artist B");
    expect(sections[0].songs.map((song) => song.title)).toEqual(["First", "Second"]);
    expect(sections[0].songs[0].detail).toBe("Album A · Track 1 · 1:01");
  });

  it("keeps files visible when cached server metadata is unavailable", () => {
    const sections = buildDownloadsSections({
      downloadedTracks: [
        { artistId: "artist-id", albumId: "album-id", trackId: "track-id", fileUri: "file:///track" },
      ],
      artistNames: new Map(),
      albums: new Map(),
    });

    expect(sections[0]).toMatchObject({
      title: "Unknown artist",
      songs: [{ title: "Track track-id", detail: "Unknown album" }],
    });
  });
});
