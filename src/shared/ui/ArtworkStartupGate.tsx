import { useArtworkSync, useRequiredQueries } from "@/shared/api";
import { appLogger } from "@/shared/lib/logger";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { PropsWithChildren, useEffect, useState } from "react";
import { InteractionManager } from "react-native";

const BACKGROUND_REPAIR_DELAY_MS = 750;

export function ArtworkStartupGate({ children }: PropsWithChildren) {
  const isRestoring = useIsRestoring();
  const queryClient = useQueryClient();
  const queries = useRequiredQueries();
  const { start } = useArtworkSync();
  const [syncNeeded, setSyncNeeded] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    let cancelled = false;
    queries.artwork.repository
      .getInitialSyncState()
      .then(({ complete }) => {
        if (!cancelled) setSyncNeeded(!complete);
      })
      .catch((error) => {
        appLogger.COVER_ART.error(`Artwork manifest check failed: ${String(error)}`);
        if (!cancelled) setSyncNeeded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [queries.artwork.repository]);

  useEffect(() => {
    if (!syncNeeded || isRestoring) return;
    queryClient.removeQueries({ queryKey: ["cover-art"] });

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const interaction = InteractionManager.runAfterInteractions(() => {
      timeout = setTimeout(() => {
        const repair = async () => {
          try {
            await start();
          } finally {
            await queries.artwork.repository.markInitialSyncAttempted();
          }
        };
        repair()
          .catch((error) =>
            appLogger.COVER_ART.warn(`Background artwork repair failed: ${String(error)}`),
          )
          .finally(() => {
            if (!cancelled) setSyncNeeded(false);
          });
      }, BACKGROUND_REPAIR_DELAY_MS);
    });

    return () => {
      cancelled = true;
      interaction.cancel();
      if (timeout) clearTimeout(timeout);
    };
  }, [isRestoring, queries, queryClient, start, syncNeeded]);

  return children;
}
