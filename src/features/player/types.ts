import { MyDownloadTask } from "../downloads";

export interface MediaItemExtras {
  artistId: string | undefined;
  albumId: string | undefined;
  trackNumber: number | undefined;
  downloadTask: MyDownloadTask | undefined;
}
