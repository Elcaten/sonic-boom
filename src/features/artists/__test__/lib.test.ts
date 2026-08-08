import type { SectionedArtist } from "../types";
import { groupArtistsBySection } from "../lib";

const sectionedArtist = (id: string, name: string, section: string): SectionedArtist =>
  ({ artist: { id, name }, section }) as SectionedArtist;

describe("groupArtistsBySection", () => {
  const artists = [
    sectionedArtist("alpha", "Alpha", "A"),
    sectionedArtist("another", "Another", "A"),
    sectionedArtist("beta", "Beta", "B"),
  ];

  it("combines text search with downloaded album ownership", () => {
    const sections = groupArtistsBySection({
      artists,
      query: "a",
      downloadedOnly: true,
      downloadedAlbumsByArtist: new Map([
        ["alpha", new Set(["album-one", "album-two"])],
        ["beta", new Set<string>()],
      ]),
    });

    expect(sections).toEqual([
      { title: "A", data: [expect.objectContaining({ id: "alpha" })] },
    ]);
  });

  it("keeps the original sections when downloaded filtering is disabled", () => {
    const sections = groupArtistsBySection({
      artists,
      query: "another",
      downloadedOnly: false,
      downloadedAlbumsByArtist: new Map(),
    });

    expect(sections).toEqual([
      { title: "A", data: [expect.objectContaining({ id: "another" })] },
    ]);
  });
});
