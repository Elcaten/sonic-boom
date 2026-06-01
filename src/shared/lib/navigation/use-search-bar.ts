import { useNavigation } from "expo-router";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { useCallback, useEffect, useState } from "react";

type HeaderSearchBarOptions = NonNullable<ExtendedStackNavigationOptions["headerSearchBarOptions"]>;

type UseSearchBarParams = {
  placeholder?: string;
  autoCapitalize?: HeaderSearchBarOptions["autoCapitalize"];
};

export function useSearchBar({
  placeholder = "Search",
  autoCapitalize = "none",
}: UseSearchBarParams = {}) {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");

  const reset = useCallback(() => {
    setQuery("");
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize,
        placeholder,
        onChangeText(e) {
          setQuery(e.nativeEvent.text);
        },
        onCancelButtonPress: reset,
      },
    } satisfies ExtendedStackNavigationOptions);
  }, [autoCapitalize, navigation, placeholder, reset]);

  return { query, setQuery, reset };
}
