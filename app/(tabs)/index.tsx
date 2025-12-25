import { Button, View } from "react-native";

import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { useSubsonicQuery } from "@/hooks/use-subsonic-query";
import { subsonicQueries } from "@/utils/subsonicQueries";

export default function HomeScreen() {
  const auth = useAuth();
  const curentSessionQuery = useSubsonicQuery(
    subsonicQueries.currentNavidromeSession()
  );

  return (
    <ThemedSafeAreaView>
      <View style={{ height: 96 }} />
      {curentSessionQuery.data && (
        <ThemedText>
          {JSON.stringify(curentSessionQuery.data, null, 2)}
        </ThemedText>
      )}
      <Button title="Log out" onPress={() => auth.clearAll()} />
    </ThemedSafeAreaView>
  );
}
