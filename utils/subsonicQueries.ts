import { CallApiParams } from "@/hooks/use-subsonic-query";

export const subsonicQueries = {
  streamUrl: (trackId: string) => ({
    queryKey: ["stream-url", trackId],
    callApi: (...[api, session]: CallApiParams) => {
      const url = new URL(`${api.baseURL()}rest/stream.view`);
      url.searchParams.set("v", "1.16");
      url.searchParams.set("c", "subsonic-api");
      url.searchParams.set("f", "json");
      url.searchParams.set("id", trackId);
      url.searchParams.set("u", session.username);
      url.searchParams.set("t", session.subsonicToken);
      url.searchParams.set("s", session.subsonicSalt);

      console.log(url.toString());
      return url.toString();
    },
  }),

  coverArt: (trackId: string) => ({
    queryKey: ["cover-art", trackId],
    callApi: (...[api]: CallApiParams) => api.getCoverArt({ id: trackId }),
  }),

  song: (trackId: string) => ({
    queryKey: ["song", trackId],
    callApi: (...[api]: CallApiParams) => api.getSong({ id: trackId }),
  }),
};
