import "@rntp/player";

declare module "@rntp/player" {
  export interface MediaItem {
    id: string;
    artistId?: string;
    albumId?: string;
  }
}
