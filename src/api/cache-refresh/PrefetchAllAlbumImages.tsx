import { useRequiredQueries } from "@/api";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import { useEffect, useState } from "react";
import { View } from "react-native";

const PAGE_SIZE = 10;

export function PrefetchAllAlbumImages({
  onLoadEnd,
  size,
}: {
  onLoadEnd: () => void;
  size: 48 | 256;
}) {
  const queries = useRequiredQueries();
  const [offset, setOffset] = useState(0);
  const albumListQuery = useQuery(queries.albumList({ size: PAGE_SIZE, offset }));

  useEffect(() => {
    const hasMoreData = Boolean(albumListQuery.data?.albumList.album);
    if (!albumListQuery.isPending && !hasMoreData) {
      onLoadEnd();
    }
  }, [albumListQuery.data?.albumList, albumListQuery.isPending, onLoadEnd]);

  const coverArtQueries = useQueries({
    queries: albumListQuery.data?.albumList.album?.map((album) => queries.coverArtImage(album.id, size)) ?? [],
    combine: (results) => ({
      data: results.map((result) => result.data!),
      isPending: results.some((result) => result.isPending),
    }),
  });

  if (albumListQuery.isPending || coverArtQueries.isPending) {
    return null;
  }

  return (
    <PrefetchBatch
      key={offset}
      sources={coverArtQueries.data}
      onLoadEnd={() => setOffset((value) => value + PAGE_SIZE)}
    />
  );
}

function PrefetchBatch({ sources, onLoadEnd }: { sources: ImageSource[]; onLoadEnd: () => void }) {
  const [loadedCacheKeys, setLoadedCacheKeys] = useState<string[]>([]);

  useEffect(() => {
    if (loadedCacheKeys.length === sources.length) {
      onLoadEnd();
    }
  }, [loadedCacheKeys.length, onLoadEnd, sources.length]);

  return (
    <>
      {sources.map((source) => (
        <View key={source.cacheKey}>
          <Image
            style={{ width: 72, height: 72 }}
            source={source}
            cachePolicy="memory-disk"
            onLoad={() => setLoadedCacheKeys((value) => [...value, source.cacheKey!])}
            onError={() => setLoadedCacheKeys((value) => [...value, source.cacheKey!])}
          />
        </View>
      ))}
    </>
  );
}
