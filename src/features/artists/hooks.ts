import { useRequiredQueries } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { SectionedArtist } from "./types";

export function useArtists() {
  const queries = useRequiredQueries();
  const artistsQuery = useQuery(queries.artists());

  const sectionedArtists: SectionedArtist[] =
    artistsQuery.data?.artists.index?.flatMap((section) =>
      (section.artist ?? []).map((artist) => ({
        artist,
        section: section.name,
      })),
    ) ?? [];

  return { artistsQuery, sectionedArtists };
}

export function useArtistAlbums(artistId: string | undefined) {
  const queries = useRequiredQueries();
  const normalizedArtistId = artistId ?? "";

  const artistQuery = useQuery({
    ...queries.artist(normalizedArtistId),
    enabled: Boolean(artistId),
  });

  const albums = artistQuery.data?.artist.album ?? [];
  return { artistQuery, albums };
}
