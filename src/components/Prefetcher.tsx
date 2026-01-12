import { useRequiredQueries } from "@/context/app-context";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import React, { useEffect, useState } from "react";
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
  const albumListQuery = useQuery(queries.albumList({ size: PAGE_SIZE, offset: offset }));

  useEffect(() => {
    const hasMoreData = Boolean(albumListQuery.data?.albumList.album);
    if (!albumListQuery.isFetching && !hasMoreData) {
      onLoadEnd();
    }
  }, [albumListQuery.data?.albumList, albumListQuery.isFetching, onLoadEnd]);

  const coverArtQueries = useQueries({
    queries:
      albumListQuery.data?.albumList.album?.map((album) => queries.coverArtImage(album.id, size)) ??
      [],
    combine: (resuts) => ({
      data: resuts.map((resut) => resut.data!), //TODO: avoid !
      isFetching: resuts.some((result) => result.isFetching),
    }),
  });

  if (albumListQuery.isFetching || coverArtQueries.isFetching) {
    return null;
  }

  return (
    <PrefetchBatch
      key={offset}
      sources={coverArtQueries.data}
      onLoadEnd={() => setOffset((v) => v + PAGE_SIZE)}
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
            onLoadEnd={() => {
              console.log("PRE " + source.cacheKey);
              setLoadedCacheKeys((v) => [...v, source.cacheKey!]);
            }}
          />
        </View>
      ))}
    </>
  );
}
