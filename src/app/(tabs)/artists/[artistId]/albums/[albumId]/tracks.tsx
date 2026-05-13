import { CoverArt } from "@/components/CoverArt";
import { useRequiredQueries } from "@/context/app-context";
import { formatDuration } from "@/utils/formatDuration";
import { shuffleArray } from "@/utils/shuffle-array";
import {
  Button,
  Host,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  font,
  foregroundStyle,
  frame,
  listStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import TrackPlayer, { useActiveMediaItem, useIsPlaying } from "@rntp/player";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";

const useAlbumTracks = ({ albumId }: { albumId: string }) => {
  const queries = useRequiredQueries();

  const albumQuery = useQuery(queries.album(albumId));
  const albumArtworkUrlQuery = useQuery(queries.coverArtImage(albumId, 256));
  const streamUrlQueries = useQueries({
    queries:
      albumQuery.data?.album.song?.map((item) => ({
        ...queries.streamUrl(item.id),
        select: (url: string) => {
          return { id: item.id, url: url };
        },
        enabled: Boolean(albumQuery.data?.album.song),
      })) ?? [],
    combine: (queries) => ({
      data: new Map(queries.map((query) => [query.data?.id!, query.data?.url!])), //TODO: avoid !
      isPending: queries.some((q) => q.isPending),
    }),
  });

  const tracks = useMemo(() => {
    return albumQuery.data?.album.song?.map((song) => ({
      id: song.id,
      url: streamUrlQueries.data.get(song.id)!,
      title: song.title,
      artist: song.artist,
      artistId: song.artistId,
      album: song.album,
      albumId: song.albumId,
      artworkUrl: albumArtworkUrlQuery.data?.uri,
    }));
  }, [albumArtworkUrlQuery.data?.uri, albumQuery.data?.album.song, streamUrlQueries.data]);

  return {
    isPending: albumQuery.isPending || albumArtworkUrlQuery.isPending || streamUrlQueries.isPending,
    data: tracks,
  };
};

export default function AlbumTracks() {
  const { albumId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();
  const queries = useRequiredQueries();
  const albumQuery = useQuery(queries.album(albumId));
  const albumTracks = useAlbumTracks({ albumId });

  const playing = useIsPlaying();
  const activeTrack = useActiveMediaItem();
  console.log(activeTrack);

  const [isSettingUpQueue, setIsSettingUpQueue] = useState(false);

  const handlePlayAlbumPress = async () => {
    if (!albumTracks.data) {
      return;
    }

    TrackPlayer.setMediaItems(albumTracks.data);
    TrackPlayer.play();
  };

  const handleShuffleAlbumPress = async () => {
    if (!albumTracks.data) {
      return;
    }

    const shuffledTracks = shuffleArray(albumTracks.data);
    await TrackPlayer.setMediaItems(shuffledTracks);
    TrackPlayer.play();
  };

  const handleActiveItemPress = async (trackId: string) => {
    if (trackId === activeTrack?.id) {
      if (playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
    }
  };

  const handleInactiveItemPress = async (trackId: string) => {
    if (!albumTracks.data) {
      return;
    }

    setIsSettingUpQueue(true);
    await TrackPlayer.stop();
    await TrackPlayer.setMediaItems(albumTracks.data);
    const startIndex = albumTracks.data.findIndex((track) => track.id === trackId);
    await TrackPlayer.skipToIndex(startIndex);
    await TrackPlayer.play();
    setIsSettingUpQueue(false);
  };

  const { width } = useWindowDimensions();
  const isWideLayout = width > 600;

  const topSectionSpacing = 16;

  const Stack = isWideLayout ? HStack : VStack;

  return (
    <Host style={{ flex: 1 }}>
      {/* // TODO: add listRowSeparator modifier when available */}
      <List modifiers={[listStyle("inset")]}>
        {/* List header */}
        <Stack spacing={topSectionSpacing}>
          {/* Cover Art */}
          <VStack modifiers={[frame({ width: 256, height: 256 })]}>
            <CoverArt id={albumId} size={256} elevated />
          </VStack>
          <VStack spacing={topSectionSpacing}>
            {/* Album & Artist */}
            <VStack modifiers={[frame({ maxHeight: Infinity })]} spacing={4}>
              <Text modifiers={[font({ weight: "semibold", size: 20 })]}>
                {albumQuery.data?.album.name || " "}
              </Text>
              <Text
                modifiers={[
                  font({ size: 20 }),
                  foregroundStyle({ type: "hierarchical", style: "secondary" }),
                  font({ weight: "medium" }),
                ]}
              >
                {albumQuery.data?.album.artist || " "}
              </Text>
            </VStack>
            {/* Buttons; padding to fix buttons not aligned with cover art in wide layout */}
            <HStack spacing={12} modifiers={[padding({ bottom: 6 })]}>
              <Button
                modifiers={[buttonStyle("bordered"), controlSize("large")]}
                onPress={handlePlayAlbumPress}
              >
                <HStack modifiers={[frame({ maxWidth: Infinity })]} spacing={8}>
                  <Image systemName="play.fill" size={18} />
                  <Text>Play</Text>
                </HStack>
              </Button>
              <Button
                modifiers={[buttonStyle("bordered"), controlSize("large")]}
                onPress={handleShuffleAlbumPress}
              >
                <HStack modifiers={[frame({ maxWidth: Infinity })]} spacing={8}>
                  <Image systemName="shuffle" size={18} />
                  <Text>Shuffle</Text>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </Stack>

        {/* Tracks */}
        <Section>
          {albumQuery.data?.album.song?.map((item) => {
            const isActive = item.id === activeTrack?.id && !isSettingUpQueue;

            return (
              <Button
                key={item.id}
                onPress={() =>
                  isActive ? handleActiveItemPress(item.id) : handleInactiveItemPress(item.id)
                }
              >
                <HStack spacing={12}>
                  <Text
                    modifiers={[
                      frame({ width: 32 }),
                      font({ weight: isActive ? "semibold" : "regular" }),
                      foregroundStyle({
                        type: "hierarchical",
                        style: isActive ? "primary" : "secondary",
                      }),
                    ]}
                  >
                    {String(item.track)}
                  </Text>
                  <Text modifiers={[font({ weight: isActive ? "semibold" : "regular" })]}>
                    {item.title}
                  </Text>
                  <Spacer />
                  {item.duration && (
                    <Text
                      modifiers={[
                        padding({ trailing: 16 }),
                        foregroundStyle({ type: "hierarchical", style: "secondary" }),
                      ]}
                    >
                      {formatDuration(item.duration)}
                    </Text>
                  )}
                </HStack>
              </Button>
            );
          })}
        </Section>

        {/* Padding to account for FloatingPlayer */}
        <Section modifiers={[frame({ height: 64 })]}>{null}</Section>
      </List>
    </Host>
  );
}
