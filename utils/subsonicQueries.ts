import { SubsonicAPI } from "subsonic-api";

export const subsonicQueries = {
  stream: (trackId: string) => ({
    queryKey: ["stream", trackId],
    callApi: (api: SubsonicAPI) => api.stream({ id: trackId }),
  }),

  coverArt: (trackId: string) => ({
    queryKey: ["cover-art", trackId],
    callApi: (api: SubsonicAPI) => api.getCoverArt({ id: trackId }),
  }),

  song: (trackId: string) => ({
    queryKey: ["song", trackId],
    callApi: (api: SubsonicAPI) => api.getSong({ id: trackId }),
  }),
};
