import { useRequiredQueries } from "@/api";
import { appLogger } from "@/lib/logger";
import { useColorScheme } from "@/theme";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { ImageStyle, StyleProp, StyleSheet, View } from "react-native";

export function CoverArt({
  id,
  style,
  size,
  elevated = false,
}: {
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

  const shadowStyle = {
    32: undefined,
    48: undefined,
    256: theme === "light" ? styles.shadowContainer : styles.shadowContainerDark,
  }[size];

  const imgSize = size;

  return (
    <View style={[{ width: imgSize, height: imgSize }, elevated && shadowStyle]}>
      <Image
        placeholder={{ blurhash: getRandomBlurhash() }}
        placeholderContentFit="fill"
        source={coverArtQuery?.data}
        cachePolicy="memory-disk"
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
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  shadowContainerDark: {
    shadowColor: "#282828",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
});

const blurHashes = [
  "LHCP4AxbR*I?}?-8xHj]4UIoa}WU",
  "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
  "L6Pj0^i_.AyE_3t7t7R**0o#DgR4",
  "L5H2EC=PM+yV0g-mq.wG9c010J}I",
  "L9ASQf~V~U4T0KNGMwj[8^xa%Mt6",
  "L4N8;S2U%M~q00M{M{t7xuxu%Mof",
  "L7P4Mwof.8%N~qM{M{WB00Rjxuof",
  "L8CP4A-;RjI?}%j?j[WBIpofxvWB",
  "L6Pj0^t7?bxu_3M{Rjof00RjRjof",
  "L5H2ECM{~qM{00WBxut7xut7M{of",
];

const getRandomBlurhash = () => {
  const randomIndex = Math.floor(Math.random() * blurHashes.length);
  return blurHashes[randomIndex];
};
