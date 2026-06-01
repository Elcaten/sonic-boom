// src/features/search-media/ui/search-media-list.tsx
import { MediaListItem } from "@/shared/ui/MediaListItem";
import { Spacer } from "@expo/ui";
import {
  ContentUnavailableView,
  Host,
  HStack,
  List,
  ProgressView,
  Section,
} from "@expo/ui/swift-ui";
import { scaleEffect } from "@expo/ui/swift-ui/modifiers";
import { SearchItem } from "../model/types"; // Assuming this is where your type lives
import { useSearchMedia } from "../model/use-search-media";

interface SearchMediaListProps {
  search: ReturnType<typeof useSearchMedia>;
  resolveHref: (item: SearchItem) => any;
}

export function SearchMediaList({ search, resolveHref }: SearchMediaListProps) {
  const { isLoading, query, debouncedQuery, results, recentSearches, handleResultSelect } = search;

  // DRY up the item rendering logic. The feature handles the data mapping,
  // but relies on the injected resolveHref for the destination.
  const renderItem = (item: SearchItem) => {
    let title, subtitle, coverId;

    if (item.type === "Song") {
      if (!item.song.albumId || !item.song.artistId) return null;
      title = item.song.title;
      subtitle = `Song · ${item.song.artist}`;
      coverId = item.song.id;
    } else if (item.type === "Album") {
      title = item.album.title;
      subtitle = `Album · ${item.album.artist}`;
      coverId = item.album.id;
    } else if (item.type === "Artist") {
      title = item.artist.name;
      subtitle = "Artist";
      coverId = item.artist.id;
    }

    if (!title || !subtitle || !coverId) {
      return null;
    }

    return (
      <MediaListItem
        key={coverId}
        href={resolveHref(item)}
        onPress={() => handleResultSelect(item)}
        title={title}
        subtitle={subtitle}
        coverId={coverId}
      />
    );
  };

  if (isLoading) {
    return (
      <Host style={{ flex: 1 }}>
        <Spacer />
        <ProgressView modifiers={[scaleEffect(1.5)]} />
        <Spacer />
      </Host>
    );
  }

  if (query === "") {
    return (
      <Host style={{ flex: 1 }}>
        <List>
          <Section title="Recently Searched">
            {recentSearches.map((item, index) => (
              <HStack key={index}>{renderItem(item)}</HStack>
            ))}
          </Section>
        </List>
      </Host>
    );
  }

  if (!results?.album?.length && !results?.artist?.length && !results?.song?.length) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title={`No results for ${debouncedQuery}`}
          description="Try a new search"
          systemImage="magnifyingglass"
        />
      </Host>
    );
  }

  return (
    <Host style={{ flex: 1 }}>
      <List>
        {results?.song && results.song.length > 0 && (
          <Section title="Songs">
            {results.song.map((song) => renderItem({ type: "Song", song }))}
          </Section>
        )}
        {results?.album && results.album.length > 0 && (
          <Section title="Albums">
            {results.album.map((album) => renderItem({ type: "Album", album }))}
          </Section>
        )}
        {results?.artist && results.artist.length > 0 && (
          <Section title="Artists">
            {results.artist.map((artist) => renderItem({ type: "Artist", artist }))}
          </Section>
        )}
      </List>
    </Host>
  );
}
