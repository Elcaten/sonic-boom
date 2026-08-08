import { useRequiredQueries } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { AlbumData, AlbumSong } from "../types";

export function useAlbum(albumId: string) {
  const queries = useRequiredQueries();
  const albumQuery = useQuery({
    ...queries.album(albumId),
    enabled: Boolean(albumId),
  });

  const album: AlbumData | undefined = albumQuery.data?.album;
  const songs: AlbumSong[] = album?.song ?? [];
  return { albumQuery, album, songs };
}
