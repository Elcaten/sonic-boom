import TrackPlayer, { Track } from "react-native-track-player";

export const subsonicTrackPlayer = {
  add: async (...track: SubsonicTrack[]) => {
    return TrackPlayer.add(track);
  },
};

export type SubsonicTrack = Track & {
  id: string;
  artistId?: string;
  albumId?: string;
};
