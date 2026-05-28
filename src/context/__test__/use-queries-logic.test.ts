import { useQueriesLogic } from "../use-queries-logic";
import { SubsonicAPI } from "subsonic-api";

// Mock useMemo to call the factory function directly
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useMemo: (fn: () => unknown) => fn(),
}));

// Mock expo-image's Image.getCachePathAsync
jest.mock("expo-image", () => ({
  Image: {
    getCachePathAsync: jest.fn(),
  },
}));

// Mock app-logger
jest.mock("@/utils/app-logger", () => ({
  appLogger: {
    QUERY: { info: jest.fn(), error: jest.fn() },
  },
}));

// Mock get-cover-cache-key
jest.mock("@/components/feature/CoverArt/get-cover-cache-key", () => ({
  getCoverCacheKey: ({ id, size }: { id: string; size: number }) => `cover-${id}-${size}`,
}));

import { Image } from "expo-image";
import { appLogger } from "@/utils/app-logger";

const makeApi = (overrides: Partial<InstanceType<typeof SubsonicAPI>> = {}) => {
  const api: Partial<InstanceType<typeof SubsonicAPI>> = {
    getAlbumList: jest.fn(),
    buildUrl: jest.fn(),
    getSong: jest.fn(),
    search2: jest.fn(),
    getAlbum: jest.fn(),
    getArtists: jest.fn(),
    getArtist: jest.fn(),
    ...overrides,
  };
  return api as InstanceType<typeof SubsonicAPI>;
};

describe("useQueriesLogic", () => {
  describe("when api is null", () => {
    it(
      "returns null",
      () => {
        const result = useQueriesLogic(null);
        expect(result).toBeNull();
      },
      30000
    );
  });

  describe("when api is provided", () => {
    let api: InstanceType<typeof SubsonicAPI>;
    let queries: ReturnType<typeof useQueriesLogic>;

    beforeEach(() => {
      jest.clearAllMocks();
      api = makeApi();
      queries = useQueriesLogic(api);
    });

    it(
      "returns a non-null queries object",
      () => {
        expect(queries).not.toBeNull();
      },
      30000
    );

    // ============================
    // albumList
    // ============================
    describe("albumList", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.albumList({ size: 20, offset: 0 });
          expect(options.queryKey).toEqual(["albumList", 20, 0]);
        },
        30000
      );

      it(
        "queryFn calls api.getAlbumList with alphabeticalByArtist type",
        async () => {
          (api.getAlbumList as jest.Mock).mockResolvedValue({ albumList: [] });
          const options = queries!.albumList({ size: 10, offset: 5 });
          await options.queryFn!({} as never);
          expect(api.getAlbumList).toHaveBeenCalledWith({
            type: "alphabeticalByArtist",
            size: 10,
            offset: 5,
          });
        },
        30000
      );

      it(
        "queryKey reflects different sizes and offsets",
        () => {
          const opts1 = queries!.albumList({ size: 50, offset: 100 });
          expect(opts1.queryKey).toEqual(["albumList", 50, 100]);
        },
        30000
      );
    });

    // ============================
    // streamUrl
    // ============================
    describe("streamUrl", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.streamUrl("track-123");
          expect(options.queryKey).toEqual(["stream-url", "track-123"]);
        },
        30000
      );

      it(
        "queryFn calls api.buildUrl with stream method and track id",
        async () => {
          const mockUrl = { toString: () => "https://example.com/stream?id=track-123" };
          (api.buildUrl as jest.Mock).mockResolvedValue(mockUrl);
          const options = queries!.streamUrl("track-123");
          const result = await options.queryFn!({} as never);
          expect(api.buildUrl).toHaveBeenCalledWith("stream", { id: "track-123" });
          expect(result).toBe("https://example.com/stream?id=track-123");
        },
        30000
      );
    });

    // ============================
    // coverArtImage
    // ============================
    describe("coverArtImage", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.coverArtImage("entity-1", 256);
          expect(options.queryKey).toEqual(["cover-art", "entity-1", 256]);
        },
        30000
      );

      it(
        "is disabled when entityId is undefined",
        () => {
          const options = queries!.coverArtImage(undefined, 48);
          expect(options.enabled).toBe(false);
        },
        30000
      );

      it(
        "is enabled when entityId is provided",
        () => {
          const options = queries!.coverArtImage("album-1", 256);
          expect(options.enabled).toBe(true);
        },
        30000
      );

      it(
        "queryFn returns cached artwork when cache hit",
        async () => {
          (Image.getCachePathAsync as jest.Mock).mockResolvedValue("/cache/cover-album-1-32.jpg");
          const options = queries!.coverArtImage("album-1", 32);
          const result = await options.queryFn!({} as never);
          expect(result).toEqual({
            uri: "/cache/cover-album-1-32.jpg",
            cacheKey: "cover-album-1-32",
          });
          expect(api.buildUrl).not.toHaveBeenCalled();
          expect(appLogger.QUERY.info).toHaveBeenCalledWith(
            expect.stringContaining("Cached artwork")
          );
        },
        30000
      );

      it(
        "queryFn fetches from API when cache miss",
        async () => {
          (Image.getCachePathAsync as jest.Mock).mockResolvedValue(null);
          const mockUrl = { toString: () => "https://example.com/getCoverArt?id=album-2&size=96" };
          (api.buildUrl as jest.Mock).mockResolvedValue(mockUrl);

          const options = queries!.coverArtImage("album-2", 48);
          const result = await options.queryFn!({} as never);

          expect(api.buildUrl).toHaveBeenCalledWith("getCoverArt", { id: "album-2", size: 96 });
          expect(result).toEqual({
            uri: "https://example.com/getCoverArt?id=album-2&size=96",
            cacheKey: "cover-album-2-48",
          });
          expect(appLogger.QUERY.info).toHaveBeenCalledWith(
            expect.stringContaining("Fetched artwork")
          );
        },
        30000
      );

      it(
        "queryFn uses size * 2 for the API request",
        async () => {
          (Image.getCachePathAsync as jest.Mock).mockResolvedValue(null);
          const mockUrl = { toString: () => "https://example.com/getCoverArt?size=512" };
          (api.buildUrl as jest.Mock).mockResolvedValue(mockUrl);

          const options = queries!.coverArtImage("entity-x", 256);
          await options.queryFn!({} as never);

          expect(api.buildUrl).toHaveBeenCalledWith("getCoverArt", { id: "entity-x", size: 512 });
        },
        30000
      );

      it(
        "has staleTime set to undefined",
        () => {
          const options = queries!.coverArtImage("entity-1", 256);
          expect(options.staleTime).toBeUndefined();
        },
        30000
      );
    });

    // ============================
    // song
    // ============================
    describe("song", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.song("song-456");
          expect(options.queryKey).toEqual(["song", "song-456"]);
        },
        30000
      );

      it(
        "queryFn calls api.getSong with correct id",
        async () => {
          const mockSong = { id: "song-456", title: "Test Song" };
          (api.getSong as jest.Mock).mockResolvedValue(mockSong);
          const options = queries!.song("song-456");
          const result = await options.queryFn!({} as never);
          expect(api.getSong).toHaveBeenCalledWith({ id: "song-456" });
          expect(result).toBe(mockSong);
        },
        30000
      );
    });

    // ============================
    // search
    // ============================
    describe("search", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.search({ query: "rock" });
          expect(options.queryKey).toEqual(["song", "rock"]);
        },
        30000
      );

      it(
        "is disabled when query is empty",
        () => {
          const options = queries!.search({ query: "" });
          expect(options.enabled).toBe(false);
        },
        30000
      );

      it(
        "is enabled when query is non-empty",
        () => {
          const options = queries!.search({ query: "pop" });
          expect(options.enabled).toBe(true);
        },
        30000
      );

      it(
        "queryFn calls api.search2 with correct params",
        async () => {
          (api.search2 as jest.Mock).mockResolvedValue({
            searchResult2: { album: [], artist: [], song: [] },
          });
          const options = queries!.search({ query: "rock" });
          await options.queryFn!({} as never);
          expect(api.search2).toHaveBeenCalledWith({
            query: "rock",
            songCount: 100,
            albumCount: 5,
            artistCount: 5,
          });
        },
        30000
      );

      it(
        "filters albums by title matching query (case insensitive)",
        async () => {
          (api.search2 as jest.Mock).mockResolvedValue({
            searchResult2: {
              album: [
                { id: "1", title: "Rock Classics" },
                { id: "2", title: "Jazz Collection" }, // should be filtered out
                { id: "3", title: "Hard Rock" },
              ],
              artist: [],
              song: [],
            },
          });
          const options = queries!.search({ query: "rock" });
          const result = await options.queryFn!({} as never);
          expect(result.album).toHaveLength(2);
          expect(result.album!.map((a: { id: string }) => a.id)).toEqual(["1", "3"]);
        },
        30000
      );

      it(
        "filters songs by title matching query (case insensitive)",
        async () => {
          (api.search2 as jest.Mock).mockResolvedValue({
            searchResult2: {
              album: [],
              artist: [],
              song: [
                { id: "s1", title: "Bohemian Rhapsody" }, // should be filtered out
                { id: "s2", title: "Rock You" },
                { id: "s3", title: "ROCK ANTHEM" },
              ],
            },
          });
          const options = queries!.search({ query: "rock" });
          const result = await options.queryFn!({} as never);
          expect(result.song).toHaveLength(2);
          expect(result.song!.map((s: { id: string }) => s.id)).toEqual(["s2", "s3"]);
        },
        30000
      );

      it(
        "returns artists unfiltered",
        async () => {
          const artists = [{ id: "a1", name: "Artist One" }, { id: "a2", name: "Artist Two" }];
          (api.search2 as jest.Mock).mockResolvedValue({
            searchResult2: {
              album: [],
              artist: artists,
              song: [],
            },
          });
          const options = queries!.search({ query: "something" });
          const result = await options.queryFn!({} as never);
          expect(result.artist).toEqual(artists);
        },
        30000
      );

      it(
        "handles undefined album and song gracefully",
        async () => {
          (api.search2 as jest.Mock).mockResolvedValue({
            searchResult2: {
              album: undefined,
              artist: [],
              song: undefined,
            },
          });
          const options = queries!.search({ query: "test" });
          const result = await options.queryFn!({} as never);
          expect(result.album).toBeUndefined();
          expect(result.song).toBeUndefined();
        },
        30000
      );
    });

    // ============================
    // album
    // ============================
    describe("album", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.album("album-789");
          expect(options.queryKey).toEqual(["album", "album-789"]);
        },
        30000
      );

      it(
        "queryFn calls api.getAlbum with correct id",
        async () => {
          const mockAlbum = { id: "album-789", name: "Test Album" };
          (api.getAlbum as jest.Mock).mockResolvedValue(mockAlbum);
          const options = queries!.album("album-789");
          const result = await options.queryFn!({} as never);
          expect(api.getAlbum).toHaveBeenCalledWith({ id: "album-789" });
          expect(result).toBe(mockAlbum);
        },
        30000
      );
    });

    // ============================
    // artists
    // ============================
    describe("artists", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.artists();
          expect(options.queryKey).toEqual(["artists"]);
        },
        30000
      );

      it(
        "queryFn calls api.getArtists",
        async () => {
          const mockArtists = { artists: { index: [] } };
          (api.getArtists as jest.Mock).mockResolvedValue(mockArtists);
          const options = queries!.artists();
          const result = await options.queryFn!({} as never);
          expect(api.getArtists).toHaveBeenCalled();
          expect(result).toBe(mockArtists);
        },
        30000
      );
    });

    // ============================
    // artist
    // ============================
    describe("artist", () => {
      it(
        "returns queryOptions with correct queryKey",
        () => {
          const options = queries!.artist("artist-001");
          expect(options.queryKey).toEqual(["artist", "artist-001"]);
        },
        30000
      );

      it(
        "queryFn calls api.getArtist with correct id",
        async () => {
          const mockArtist = { id: "artist-001", name: "Test Artist" };
          (api.getArtist as jest.Mock).mockResolvedValue(mockArtist);
          const options = queries!.artist("artist-001");
          const result = await options.queryFn!({} as never);
          expect(api.getArtist).toHaveBeenCalledWith({ id: "artist-001" });
          expect(result).toBe(mockArtist);
        },
        30000
      );
    });
  });
});
