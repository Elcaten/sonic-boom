import { CoverArt } from "@/components/CoverArt";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
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
import { Link } from "expo-router";
import React from "react";

export default function ArtistsScreen() {
  const artistsQuery = useSubsonicQuery({
    queryKey: ["artists"],
    callApi: (api) => api.getArtists(),
  });

  const data =
    artistsQuery.data?.artists.index?.map((section) => ({
      title: section.name,
      data: section.artist ?? [],
    })) ?? [];

  return (
    <Host style={{ flex: 1 }}>
      <List listStyle="automatic">
        {data.map((item) => {
          return (
            <Section key={item.title} title={item.title}>
              {item.data.map((item) => {
                const title = item.name;
                const subtitle = `${item.albumCount} album(s)`;
                return (
                  <Link
                    href={{
                      pathname: "/(tabs)/artists/[artistId]/albums",
                      params: { artistId: item.id },
                    }}
                    asChild
                    key={item.id}
                  >
                    <Button>
                      <HStack spacing={16}>
                        <VStack modifiers={[frame({ width: 64, height: 64 })]}>
                          <CoverArt id={item.id} size={64} />
                        </VStack>
                        <VStack alignment="leading" spacing={2}>
                          <Text color="primary" lineLimit={1}>
                            {title}
                          </Text>
                          <Text color="secondary">{subtitle}</Text>
                        </VStack>
                        <Spacer />
                        <Image
                          systemName="chevron.right"
                          size={14}
                          color="secondary"
                        />
                      </HStack>
                    </Button>
                  </Link>
                );
              })}
            </Section>
          );
        })}
      </List>
    </Host>
  );
}
