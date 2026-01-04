import { CoverArt } from "@/components/CoverArt";
import { subsonicQueries } from "@/queries/subsonicQueries";
import {
  useEnsureSubsonicQuery,
  useSubsonicQuery,
} from "@/queries/use-subsonic-query";
import {
  SubsonicTrack,
  subsonicTrackPlayer,
} from "@/utils/subsonicTrackPlayer";
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
import { frame } from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useWindowDimensions } from "react-native";
import TrackPlayer, {
  useActiveTrack,
  useIsPlaying,
} from "react-native-track-player";

export default function AlbumTracks() {
  const { albumId, artistId } =
    useLocalSearchParams<"/(tabs)/artists/[artistId]/albums/[albumId]/tracks">();

  const albumQuery = useSubsonicQuery({
    queryKey: ["albums", artistId, albumId],
    callApi: (api) => api.getAlbum({ id: albumId }),
  });
  const albumData = albumQuery.data?.album.song ?? [];

  const { playing, bufferingDuringPlay } = useIsPlaying();
  //TODO: fix typing
  const activeTrack = useActiveTrack() as SubsonicTrack;

  const ensureQuery = useEnsureSubsonicQuery();

  const handlePlayAlbumPress = async () => {
    const tracksToAdd: SubsonicTrack[] = [];
    for (const song of albumData) {
      const streamUrl = await ensureQuery(subsonicQueries.streamUrl(song.id));
      const coverArtUrl = await ensureQuery(
        subsonicQueries.coverArtUrl(song.id, 64)
      );
      tracksToAdd.push({
        id: song.id,
        url: streamUrl,
        title: song.title,
        artist: song.artist,
        artistId: song.artistId,
        album: song.album,
        albumId: song.albumId,
        artwork: coverArtUrl,
      });
    }

    await subsonicTrackPlayer.setQueue(tracksToAdd);
    TrackPlayer.play();
  };

  const handleShuffleAlbumPress = async () => {
    alert("handleShuffleAlbumPress");
  };

  const handleTrackItemPress = async (trackId: string) => {
    //TODO: handle errors
    if (trackId === activeTrack?.id) {
      if (bufferingDuringPlay) {
        return;
      }

      if (playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
      return;
    }

    //TODO: refactor and resuse code with play album button
    const tracksToAdd: SubsonicTrack[] = [];
    for (const song of albumData) {
      const streamUrl = await ensureQuery(subsonicQueries.streamUrl(song.id));
      const coverArtUrl = await ensureQuery(
        subsonicQueries.coverArtUrl(song.id, 64)
      );
      tracksToAdd.push({
        id: song.id,
        url: streamUrl,
        title: song.title,
        artist: song.artist,
        artistId: song.artistId,
        album: song.album,
        albumId: song.albumId,
        artwork: coverArtUrl,
      });
    }

    await subsonicTrackPlayer.setQueue(tracksToAdd);
    const startIndex = albumData.findIndex((song) => song.id === trackId);
    await TrackPlayer.skip(startIndex);
    TrackPlayer.play();
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
        <Button
          variant="bordered"
          onPress={handlePlayAlbumPress}
          controlSize="large"
        >
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
        <Button
          variant="bordered"
          onPress={handleShuffleAlbumPress}
          controlSize="large"
          disabled
        >
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
          {albumData.map((item) => {
            const isActive = item.id === activeTrack?.id;

            return (
              <Button
                key={item.id}
                disabled={bufferingDuringPlay}
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
                  <Text weight={isActive ? "semibold" : "regular"}>
                    {item.title}
                  </Text>
                  <Spacer />
                  <Text> </Text>
                </HStack>
              </Button>
            );
          })}
        </Section>

        <Section modifiers={[frame({ height: 64 })]}></Section>
      </List>
    </Host>
  );
}
