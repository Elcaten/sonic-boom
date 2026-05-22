import "@rntp/player";

declare module "@rntp/player" {
  export interface MediaItemExtras {
    artistId?: string;
    albumId?: string;
  }
}
