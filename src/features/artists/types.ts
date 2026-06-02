import { ArtistID3 } from "subsonic-api";

export type SectionedArtist = {
  artist: ArtistID3;
  section: string;
};

export type ArtistSection = {
  title: string;
  data: ArtistID3[];
};
