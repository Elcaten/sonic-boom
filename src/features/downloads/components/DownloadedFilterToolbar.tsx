import { Stack } from "expo-router";
import { useDownloadedFilterStore } from "../filter-store";

export function DownloadedFilterToolbar() {
  const filter = useDownloadedFilterStore((state) => state.filter);
  const setFilter = useDownloadedFilterStore((state) => state.setFilter);

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu
        accessibilityLabel={`Filter artists and albums: ${filter === "downloaded" ? "Downloaded" : "All"}`}
        accessibilityHint="Choose which albums to show"
        icon="line.3.horizontal.decrease"
        title="Filter"
      >
        <Stack.Toolbar.MenuAction
          isOn={filter === "downloaded"}
          onPress={() => setFilter("downloaded")}
        >
          Downloaded
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction isOn={filter === "all"} onPress={() => setFilter("all")}>
          All
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
