import { useRequiredQueries } from "@/shared/api/subsonic";
import { useQuery } from "@tanstack/react-query";

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
