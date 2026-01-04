import TrackPlayer, { Track } from "react-native-track-player";

export const subsonicTrackPlayer = {
  add: async (...track: SubsonicTrack[]) => {
    return TrackPlayer.add(track);
  },
  setQueue: async (tracks: SubsonicTrack[]) => {
    return TrackPlayer.setQueue(tracks);
  },
};

export type SubsonicTrack = Track & {
  id: string;
  artistId?: string;
  albumId?: string;
};
