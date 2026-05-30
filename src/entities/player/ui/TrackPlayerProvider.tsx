import { useSetupTrackPlayer } from "../lib/use-setup-track-player";

type TrackPlayerProviderProps = {
  children: React.ReactNode;
  onLoad: () => void;
};

export const TrackPlayerProvider = ({ children, onLoad }: TrackPlayerProviderProps) => {
  useSetupTrackPlayer({ onLoad });

  return <>{children}</>;
};
