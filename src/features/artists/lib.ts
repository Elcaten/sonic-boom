import { ArtistSection, SectionedArtist } from "./types";

export function groupArtistsBySection({
  artists,
  query,
}: {
  artists: SectionedArtist[];
  query: string;
}): ArtistSection[] {
  const sanitizedSearch = query.toLocaleLowerCase();
  const groupedArtists = artists
    .filter((artist) => artist.artist.name.toLocaleLowerCase().includes(sanitizedSearch))
    .reduce<Record<string, ArtistSection["data"]>>((acc, currentArtist) => {
      if (!acc[currentArtist.section]) {
        acc[currentArtist.section] = [];
      }
      acc[currentArtist.section].push(currentArtist.artist);
      return acc;
    }, {});

  return Object.keys(groupedArtists).map((sectionTitle) => ({
    title: sectionTitle,
    data: groupedArtists[sectionTitle],
  }));
}
