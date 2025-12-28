import { Redirect } from "expo-router";

export default function HomeScreen() {
  // It seems expo dev server always tries to load index route on bundle refresh
  return <Redirect href="/(tabs)/artists" />;
}
