export const getCoverCacheKey = ({ id, size }: { id: string; size: number }) =>
  `cover-${id}-${size}`;
