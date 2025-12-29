import { ThemedText } from "@/components/themed-text";
import {
  getHeaderTitle,
  Header,
  HeaderBackButton,
} from "@react-navigation/elements";
import { Stack } from "expo-router";
import { TouchableOpacity, View } from "react-native";

function CustomStackHeader({ navigation, route, options, back }: any) {
  const title = getHeaderTitle(options, route.name);

  return (
    <Header
      title={title}
      headerLeft={(props) =>
        back ? (
          <HeaderBackButton {...props} onPress={() => navigation.goBack()} />
        ) : null
      }
      headerRight={() => (
        <TouchableOpacity
          style={{
            marginRight: 16,
            padding: 8,
          }}
        >
          <ThemedText>Edit</ThemedText>
        </TouchableOpacity>
      )}
      headerStyle={options.headerStyle}
      headerTintColor={options.headerTintColor}
    />
  );
}

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: (p) => <View></View>,
        }}
      />
      <Stack.Screen
        name="[artistId]/albums/index"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Albums",
        }}
      />
      <Stack.Screen
        name="[artistId]/albums/[albumId]/tracks"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "",
        }}
      />
    </Stack>
  );
}
