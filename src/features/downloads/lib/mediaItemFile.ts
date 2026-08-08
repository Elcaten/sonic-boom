import { Directory, File } from "expo-file-system";
import { DownloadsDirectory } from "./downloadsDirectory";
import { mediaExtension } from "./media-extension";

export const FALLBACK_ARTIST_ID = "NO_ARTIST";
export const FALLBACK_ALBUM_ID = "NO_ALBUM";
export const FALLBACK_TRACK_ID = "NO_TRACK";

export type MediaItemFileConstructorParams = {
  artistId?: string | undefined;
  albumId?: string | undefined;
  songId: string | undefined;
  mimeType: string | undefined;
};

export class MediaItemFile {
  private file: File;

  constructor(params: MediaItemFileConstructorParams) {
    this.file = new File(
      new DownloadsDirectory(),
      params.artistId ?? FALLBACK_ARTIST_ID,
      params.albumId ?? FALLBACK_ALBUM_ID,
      `${params.songId ?? FALLBACK_TRACK_ID}.${mediaExtension(params.mimeType)}`,
    );
  }

  /**
   * Returns the URI of the file if it exists, otherwise returns null.
   */
  get uri(): string | undefined {
    if (this.file.exists) {
      return this.file.uri;
    }

    return undefined;
  }

  get pathWithoutProtocol(): string {
    return this.file.uri.replace("file://", "");
  }

  get parentDirectory(): Directory {
    return this.file.parentDirectory;
  }
}
