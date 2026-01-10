import { CoverArt } from "@/components/CoverArt";
import { subsonicQuery } from "@/queries/subsonic-query";
import { useSubsonicQuery } from "@/queries/use-subsonic-query";
import { formatDuration } from "@/utils/formatDuration";
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
import { frame, padding } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useWindowDimensions } from "react-native";
import TrackPlayer, { useActiveTrack, useIsPlaying } from "react-native-track-player";

export default function AlbumTracks() {
  const { albumId } = useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();
  const albumQuery = useSubsonicQuery(subsonicQuery.album(albumId));

  const { playing } = useIsPlaying();
  const activeTrack = useActiveTrack();

  const handlePlayAlbumPress = async () => {
    if (!albumQuery.data?.tracks) {
      return;
    }

    await TrackPlayer.setQueue(albumQuery.data?.tracks);
    await TrackPlayer.play();
  };

  const handleShuffleAlbumPress = async () => {
    alert("handleShuffleAlbumPress");
  };

  const handleTrackItemPress = async (trackId: string) => {
    if (!albumQuery.data?.tracks) {
      return;
    }

    if (trackId === activeTrack?.id) {
      if (playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
      return;
    }

    await TrackPlayer.setQueue(albumQuery.data.tracks);
    const startIndex = albumQuery.data.tracks.findIndex((song) => song.id === trackId);
    await TrackPlayer.skip(startIndex);
    await TrackPlayer.play();
  };

  const { width, height } = useWindowDimensions();
  const isWideLayout = width > height;

  const topSectionSpacing = 16;

  const coverArt = (
    <VStack modifiers={[frame({ width: 256, height: 256 })]}>
      <CoverArt id={albumId} size={256} elevated />
    </VStack>
  );

  const albumArtistActions = (
    <VStack spacing={topSectionSpacing}>
      <VStack modifiers={[frame({ maxHeight: Infinity })]} spacing={4}>
        <Text weight="semibold" size={20}>
          {albumQuery.data?.album.name || " "}
        </Text>
        <Text size={20} color="secondary" weight="medium">
          {albumQuery.data?.album.artist || " "}
        </Text>
      </VStack>
      <HStack spacing={12}>
        <Button variant="bordered" onPress={handlePlayAlbumPress} controlSize="large">
          <HStack
            modifiers={[
              frame({
                maxWidth: Infinity,
              }),
            ]}
            spacing={8}
          >
            <Image systemName="play.fill" size={18} />
            <Text>Play</Text>
          </HStack>
        </Button>
        <Button variant="bordered" onPress={handleShuffleAlbumPress} controlSize="large" disabled>
          <HStack
            modifiers={[
              frame({
                maxWidth: Infinity,
              }),
            ]}
            spacing={8}
          >
            <Image systemName="shuffle" size={18} />
            <Text>Shuffle</Text>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  );

  return (
    <Host style={{ flex: 1 }}>
      <List listStyle="inset">
        {/* // TODO: add listRowSeparator modifier when available */}
        {isWideLayout ? (
          <HStack spacing={topSectionSpacing}>
            {coverArt}
            {albumArtistActions}
          </HStack>
        ) : (
          <VStack spacing={topSectionSpacing}>
            {coverArt}
            {albumArtistActions}
          </VStack>
        )}

        <Section>
          {albumQuery.data?.album.song?.map((item) => {
            const isActive = item.id === activeTrack?.id;

            return (
              <Button
                key={item.id}
                // disabled={bufferingDuringPlay}
                onPress={() => handleTrackItemPress(item.id)}
              >
                <HStack spacing={12}>
                  <Text
                    color={isActive ? "primary" : "secondary"}
                    weight={isActive ? "semibold" : "regular"}
                    modifiers={[frame({ width: 32 })]}
                  >
                    {String(item.track)}
                  </Text>
                  <Text weight={isActive ? "semibold" : "regular"}>{item.title}</Text>
                  <Spacer />
                  {item.duration && (
                    <Text color="secondary" modifiers={[padding({ trailing: 16 })]}>
                      {formatDuration(item.duration)}
                    </Text>
                  )}
                </HStack>
              </Button>
            );
          })}
        </Section>

        <Section modifiers={[frame({ height: 64 })]}>{null}</Section>
      </List>
    </Host>
  );
}
