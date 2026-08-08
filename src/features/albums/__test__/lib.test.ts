import { filterSortAlbums } from "../lib";

describe("filterSortAlbums", () => {
  const albums = [
    { id: "old", name: "Old Match", year: 2000 },
    { id: "new", name: "New Match", year: 2020 },
    { id: "other", name: "Something Else", year: 2024 },
  ];

  it("combines text search, downloaded filtering, and year sorting", () => {
    expect(
      filterSortAlbums({
        albums,
        query: "match",
        downloadedOnly: true,
        downloadedAlbumIds: new Set(["old", "new"]),
      }).map((album) => album.id),
    ).toEqual(["new", "old"]);
  });

  it("returns all matching albums when downloaded filtering is disabled", () => {
    expect(
      filterSortAlbums({
        albums,
        query: "",
        downloadedOnly: false,
        downloadedAlbumIds: new Set(["old"]),
      }).map((album) => album.id),
    ).toEqual(["other", "new", "old"]);
  });
});
