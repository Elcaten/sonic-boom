import mimedb from "./mime-db.json";

const FALLBACK_EXTENSION = "unknown";

export const mediaExtension = (mimeType: string | undefined): string => {
  return mimedb[mimeType as unknown as keyof typeof mimedb]?.extensions?.[0] ?? FALLBACK_EXTENSION;
};
