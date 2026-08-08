export type DownloadIdentity = {
  artistId: string;
  albumId: string;
  trackId: string;
};

export type DownloadTarget = DownloadIdentity & {
  contentType?: string;
};

export type DownloadedTrackRef = DownloadIdentity & {
  fileUri: string;
};

export type DownloadTaskState = DownloadIdentity &
  (
    | { status: "downloading"; progress: number; errorMessage?: never }
    | { status: "failed"; progress: number; errorMessage: string }
  );

export type DownloadStatus =
  | { state: "downloading"; progress: number }
  | { state: "partial"; progress: number }
  | { state: "downloaded"; progress: 1 }
  | { state: "failed"; progress: number };

export type DownloadTaskMap = Map<string, DownloadTaskState>;

export function getDownloadKey(identity: DownloadIdentity): string {
  return [identity.artistId, identity.albumId, identity.trackId].map(encodeURIComponent).join("::");
}
