import { Directory, File, Paths } from "expo-file-system";
import { DownloadedTrackRef, DownloadIdentity, DownloadTarget } from "../types";

const DOWNLOADS_DIRECTORY = "downloads";

const MEDIA_EXTENSIONS: Record<string, string> = {
  "audio/aac": "aac",
  "audio/flac": "flac",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/opus": "opus",
  "audio/wav": "wav",
  "audio/x-flac": "flac",
  "audio/x-m4a": "m4a",
};

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function mediaExtension(contentType: string | undefined): string {
  if (!contentType) return "audio";
  const normalizedType = contentType.split(";", 1)[0].trim().toLocaleLowerCase();
  return (
    MEDIA_EXTENSIONS[normalizedType] ??
    normalizedType.split("/").at(-1)?.replace(/^x-/, "") ??
    "audio"
  );
}

function isDirectory(entry: File | Directory): entry is Directory {
  return "list" in entry;
}

export class DownloadsRepository {
  readonly root = new Directory(Paths.document, DOWNLOADS_DIRECTORY);

  file(target: DownloadTarget): File {
    return new File(
      this.root,
      encodePathSegment(target.albumArtistId),
      encodePathSegment(target.albumId),
      `${encodePathSegment(target.trackId)}.${mediaExtension(target.contentType)}`,
    );
  }

  localUri(target: DownloadTarget): string | undefined {
    const file = this.file(target);
    return file.exists ? file.uri : undefined;
  }

  prepareDestination(target: DownloadTarget): string {
    const file = this.file(target);
    file.parentDirectory.create({ intermediates: true, idempotent: true });
    return file.uri.replace(/^file:\/\//, "");
  }

  list(): DownloadedTrackRef[] {
    if (!this.root.exists) return [];

    return this.root.list().flatMap((artistEntry) => {
      if (!isDirectory(artistEntry)) return [];
      const albumArtistId = decodePathSegment(artistEntry.name);

      return artistEntry.list().flatMap((albumEntry) => {
        if (!isDirectory(albumEntry)) return [];
        const albumId = decodePathSegment(albumEntry.name);

        return albumEntry.list().flatMap((trackEntry) => {
          if (isDirectory(trackEntry)) return [];
          if (trackEntry.name.startsWith(".") || trackEntry.name.endsWith(".tmp")) return [];
          const extensionIndex = trackEntry.name.lastIndexOf(".");
          const encodedTrackId =
            extensionIndex > 0 ? trackEntry.name.slice(0, extensionIndex) : trackEntry.name;
          if (!encodedTrackId) return [];

          return [
            {
              albumArtistId,
              albumId,
              trackId: decodePathSegment(encodedTrackId),
              fileUri: trackEntry.uri,
            },
          ];
        });
      });
    });
  }

  deleteAll(): void {
    if (this.root.exists) this.root.delete();
  }

  has(identity: DownloadIdentity & { contentType?: string }): boolean {
    return this.file(identity).exists;
  }
}

export const downloadsRepository = new DownloadsRepository();
