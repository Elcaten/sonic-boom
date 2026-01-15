import { useColors } from "@/context/app-context";
import { SectionList, Text, View } from "react-native";

export default function ColorsScreen() {
  const colors = useColors();

  return (
    <SectionList
      sections={Object.entries(colors).map(([colorName, colorValue]) => ({
        title: colorName,
        data: [{ colorName, colorValue }],
      }))}
      renderSectionHeader={({ section }) => (
        <Text style={{ fontSize: 16, marginTop: 16, color: colors.label }}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: item.colorValue,
            height: 48,
            borderWidth: 1,
            borderColor: "magenta",
          }}
        ></View>
      )}
    ></SectionList>
  );
}
