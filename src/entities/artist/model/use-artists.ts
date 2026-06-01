import { useRequiredQueries } from "@/shared/api/subsonic";
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
