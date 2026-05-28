export const Platform = {
  OS: "ios",
  Version: "17",
  select: (obj: Record<string, unknown>) => obj["ios"] ?? obj["default"],
};

export const useColorScheme = () => "light";
