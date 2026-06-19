import { createContext, useContext } from "react";
import { SubsonicAPI } from "subsonic-api";

type APIContextType = SubsonicAPI | null;

export const APIContext = createContext<APIContextType | undefined>(undefined);

export const useAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error("useAPI must be used within APIContext.Provider");
  }
  return context;
};

export const useRequiredAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error("useRequiredAPI must be used within APIContext.Provider");
  }
  if (context === null) {
    throw new Error(
      "API is not available. Ensure user credentials are set before using this hook.",
    );
  }
  return context;
};
