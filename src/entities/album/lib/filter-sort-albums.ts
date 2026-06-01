export function filterSortAlbums<T extends { name: string; year?: number | null }>({
  albums,
  query,
}: {
  albums: T[];
  query: string;
}) {
  const normalizedQuery = query.toLocaleLowerCase();

  return albums
    .filter((album) => album.name.toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}
