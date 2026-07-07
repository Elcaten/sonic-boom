import { useRequiredQueries } from "@/shared/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
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

// Preload album images so we avoid showing blurhashes on initial ArtistAlbumsScreen load
export function usePreloadAlbumImages() {
  const queryClient = useQueryClient();
  const queries = useRequiredQueries();

  return async (artistId: string) => {
    const artist = await queryClient.ensureQueryData(queries.artist(artistId));
    const albumIds = artist.artist.album?.map((a) => a.id);
    albumIds?.forEach(async (albumId) => {
      const source = await queryClient.ensureQueryData(queries.coverArtImage(albumId, 48));
      Image.loadAsync(source);
    });
  };
}
