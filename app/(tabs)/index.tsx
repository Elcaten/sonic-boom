import { Button, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { CoverArt } from "../../components/CoverArt";

export default function HomeScreen() {
  const auth = useAuth();
  const randomTrackQuery = useSubsonicQuery({
    queryKey: ["random-track"],
    callApi: (api) =>
      api
        .getRandomSongs({ size: 1 })
        .then(({ randomSongs }) => randomSongs.song?.[0] ?? null),
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        randomTrackQuery.data ? (
          <View
            style={{
              bottom: 0,
              left: 200,
              position: "absolute",
              borderWidth: 2,
              borderColor: "yellow",
            }}
          >
            <CoverArt id={randomTrackQuery.data.id} size={256} />
            {/* <View style={{ position: "absolute", right: 0, top: 0 }}>
              <ThemedText type="title">
                {randomTrackQuery.data.title}
              </ThemedText>
              <ThemedText type="title">
                {randomTrackQuery.data.artist}
              </ThemedText>
            </View> */}
          </View>
        ) : (
          <></>
        )
      }
    >
      <ThemedView>
        <Button title="Log out" onPress={() => auth.clearAll()} />
      </ThemedView>
    </ParallaxScrollView>
  );
}
