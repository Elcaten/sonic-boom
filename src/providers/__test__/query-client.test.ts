import { getQueryClient } from "../query-client";

const QUERY_CLIENT_GLOBAL_KEY = "__SONIC_BOOM_QUERY_CLIENT__";

type QueryClientGlobal = typeof globalThis & {
  [QUERY_CLIENT_GLOBAL_KEY]?: ReturnType<typeof getQueryClient>;
};

describe("development QueryClient", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete (globalThis as QueryClientGlobal)[QUERY_CLIENT_GLOBAL_KEY];
  });

  afterEach(() => {
    const globalStore = globalThis as QueryClientGlobal;
    globalStore[QUERY_CLIENT_GLOBAL_KEY]?.clear();
    delete globalStore[QUERY_CLIENT_GLOBAL_KEY];
    jest.useRealTimers();
  });

  it("preserves cached album data when the client is requested again", () => {
    const initialClient = getQueryClient();
    const album = { album: { id: "album-id", name: "Cached album" } };
    initialClient.setQueryData(["album", "album-id"], album);

    const refreshedClient = getQueryClient();

    expect(refreshedClient).toBe(initialClient);
    expect(refreshedClient.getQueryData(["album", "album-id"])).toEqual(album);
  });
});
