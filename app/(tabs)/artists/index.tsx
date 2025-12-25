import {
  SectionList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { useRouter } from "expo-router";
import React from "react";

export default function ArtistsScreen() {
  const artistsQuery = useSubsonicQuery({
    queryKey: ["artists"],
    callApi: (api) => api.getArtists(),
  });
  const router = useRouter();

  return (
    <ThemedSafeAreaView edges={["top"]}>
      <SectionList
        sections={
          artistsQuery.data?.artists.index?.map((section) => ({
            title: section.name,
            data: section.artist ?? [],
          })) ?? []
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={{ borderBottomColor: "blue", borderWidth: 1 }}>
            <TouchableOpacity
              onPress={() =>
                router.navigate({
                  pathname: "/(tabs)/artists/[artistId]/albums",
                  params: { artistId: item.id },
                })
              }
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* <CoverArt id={item.id} size={64} /> */}
                <View>
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText>{item.albumCount} album(s)</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </ThemedView>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <ThemedText type="defaultSemiBold">{title}</ThemedText>
        )}
      />
    </ThemedSafeAreaView>
  );
}

// function TabTwoScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
//       headerImage={
//         <IconSymbol
//           size={310}
//           color="#808080"
//           name="chevron.left.forwardslash.chevron.right"
//           style={styles.headerImage}
//         />
//       }
//     >
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText
//           type="title"
//           style={{
//             fontFamily: Fonts.rounded,
//           }}
//         >
//           Artists
//         </ThemedText>
//       </ThemedView>
//       <ThemedText>
//         This app includes example code to help you get started.
//       </ThemedText>
//       <Collapsible title="File-based routing">
//         <ThemedText>
//           This app has two screens:{" "}
//           <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
//           and{" "}
//           <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
//         </ThemedText>
//         <ThemedText>
//           The layout file in{" "}
//           <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{" "}
//           sets up the tab navigator.
//         </ThemedText>
//         <ExternalLink href="https://docs.expo.dev/router/introduction">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Android, iOS, and web support">
//         <ThemedText>
//           You can open this project on Android, iOS, and the web. To open the
//           web version, press <ThemedText type="defaultSemiBold">w</ThemedText>{" "}
//           in the terminal running this project.
//         </ThemedText>
//       </Collapsible>
//       <Collapsible title="Images">
//         <ThemedText>
//           For static images, you can use the{" "}
//           <ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
//           <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to
//           provide files for different screen densities
//         </ThemedText>
//         <Image
//           source={require("@/assets/images/react-logo.png")}
//           style={{ width: 100, height: 100, alignSelf: "center" }}
//         />
//         <ExternalLink href="https://reactnative.dev/docs/images">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Light and dark mode components">
//         <ThemedText>
//           This template has light and dark mode support. The{" "}
//           <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook
//           lets you inspect what the user&apos;s current color scheme is, and so
//           you can adjust UI colors accordingly.
//         </ThemedText>
//         <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Animations">
//         <ThemedText>
//           This template includes an example of an animated component. The{" "}
//           <ThemedText type="defaultSemiBold">
//             components/HelloWave.tsx
//           </ThemedText>{" "}
//           component uses the powerful{" "}
//           <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
//             react-native-reanimated
//           </ThemedText>{" "}
//           library to create a waving hand animation.
//         </ThemedText>
//         {Platform.select({
//           ios: (
//             <ThemedText>
//               The{" "}
//               <ThemedText type="defaultSemiBold">
//                 components/ParallaxScrollView.tsx
//               </ThemedText>{" "}
//               component provides a parallax effect for the header image.
//             </ThemedText>
//           ),
//         })}
//       </Collapsible>
//     </ParallaxScrollView>
//   );
// }

const styles = StyleSheet.create({
  // headerImage: {
  //   color: "#808080",
  //   bottom: -90,
  //   left: -35,
  //   position: "absolute",
  // },
  // titleContainer: {
  //   flexDirection: "row",
  //   gap: 8,
  // },

  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
});
