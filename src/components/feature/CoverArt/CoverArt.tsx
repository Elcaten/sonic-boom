import { useRequiredQueries } from "@/shared/queries/queries-context";
import { appLogger } from "@/utils/app-logger";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { ImageStyle, StyleProp, StyleSheet, useColorScheme, View } from "react-native";
import { getRandomBlurhash } from "./blur-hash";

export function CoverArt({
  id,
  style,
  size,
  elevated = false,
}: {
  /** The ID of a song, album or artist. */
  id: string | undefined;
  style?: StyleProp<ImageStyle>;
  size: Parameters<ReturnType<typeof useRequiredQueries>["coverArtImage"]>[1];
  elevated?: boolean;
}) {
  const theme = useColorScheme() ?? "light";
  const queries = useRequiredQueries();
  const coverArtQuery = useQuery(queries.coverArtImage(id, size));

  const borderRadius = {
    32: 4,
    48: 6,
    256: 12,
  }[size];

  const themedShadowContainer =
    theme === "light"
      ? [styles.shadowContainer]
      : [styles.shadowContainer, styles.shadowContainerDark];
  const shadow = {
    32: themedShadowContainer,
    48: themedShadowContainer,
    256: themedShadowContainer,
  }[size];

  const imgSize = size;

  return (
    <View style={[{ width: imgSize, height: imgSize }, elevated && shadow]}>
      <Image
        placeholder={{
          blurhash: getRandomBlurhash(),
        }}
        placeholderContentFit="fill"
        source={coverArtQuery?.data}
        cachePolicy={"memory-disk"}
        style={[{ width: imgSize, height: imgSize, borderRadius }, style]}
        onLoad={(e) => {
          appLogger.COVER_ART.info(
            `Loaded artwork from ${e.cacheType} ${coverArtQuery?.data?.cacheKey}`,
          );
        }}
        onError={() => {
          appLogger.COVER_ART.error(`Error loading artwork ${coverArtQuery?.data?.cacheKey}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  shadowContainerDark: {
    shadowColor: "#282828",
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
});
