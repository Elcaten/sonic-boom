import "react-native-track-player";

declare module "react-native-track-player" {
  export interface Track {
    id: string;
    artistId?: string;
    albumId?: string;
  }
}
