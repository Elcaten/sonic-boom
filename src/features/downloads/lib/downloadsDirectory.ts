import { Directory, File, Paths } from "expo-file-system";

const DOWNLOADS_SUBDIR = "downloads";

export class DownloadsDirectory extends Directory {
  constructor() {
    super(Paths.document, DOWNLOADS_SUBDIR);
  }

  artistDirectories(): ArtistDirectory[] {
    return this.list()
      .filter((dir) => "list" in dir)
      .map((dir) => new ArtistDirectory(dir));
  }
}

class ArtistDirectory extends Directory {
  albumDirectories(): AlbumDirectory[] {
    return this.list()
      .filter((dir) => "list" in dir)
      .map((dir) => new AlbumDirectory(dir));
  }
}

class AlbumDirectory extends Directory {
  songFiles(): File[] {
    return this.list() as unknown as File[];
  }
}
