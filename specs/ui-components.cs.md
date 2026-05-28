# UI Core Components

Shared UI primitives and music-related feature components for the mobile app.

## Core Components

Reusable primitives used throughout the app.

### DragTracker

A wrapper component that tracks horizontal drag gestures across its width and reports position as a 0–1 progress value. Fires `onDragStart`, `onDrag`, and `onDragEnd` callbacks, each receiving the clamped fractional position.

The PanResponder is created once and never recreated; event handler props are kept in refs and updated on each render to avoid stale closures.

### Slider

A styled progress/scrubbing bar built on `DragTracker`.

- Accepts a `progress` (0–1) value and an `onProgressChange` callback.
- While dragging, the displayed fill switches to the dragged position and uses an "active" foreground color; at rest it uses an "inactive" color.
- On press-in the bar animates: it stretches horizontally (×1.05) and thickens vertically (×2), with border radius also growing. On release it springs back.
- Two optional addon slots — `addonBottomLeft` and `addonBottomRight` — render below the bar and receive `{ isDragging, dragPercent }`. Their `scaleX` is counter-animated so they remain visually unsqueezed during the horizontal stretch, and they slide downward when the bar thickens.
- Colors adapt to light/dark theme.

### ListItem

A tappable row used in lists. Shows a 48 px cover art thumbnail, a primary title (single line), a secondary subtitle, and a trailing chevron. The whole row is a navigation link.

### HapticTab

A bottom tab bar button that triggers a light haptic impact on press-in on iOS before forwarding the event to the underlying pressable.

## Cover Art

Components and utilities for loading and caching artwork.

### CoverArt

Displays artwork for a song, album, or artist identified by an ID.

- Supported sizes: 32, 48, 256 px (square). Border radius scales with size (4 / 6 / 12 px).
- While the real image loads, a randomly selected blurhash is shown as a placeholder.
- Images are cached with `memory-disk` policy.
- Accepts an optional `elevated` prop that adds a drop shadow. Shadow color and opacity differ between light and dark themes.
- Logs cache hits and errors via the app logger.

### Blurhash Placeholder (`blur-hash.ts`)

Maintains a hardcoded list of ~40 blurhash strings and picks one using a normal (Gaussian) distribution, so mid-range indices are chosen more often than extremes.

### Cover Cache Key (`get-cover-cache-key.ts`)

Produces the cache key string for a cover image from its `id` and `size`: `cover-{id}-{size}`.

## PrefetchAllAlbumImages

Prefetches cover art for every album in the library so that images are warm in the cache before the user navigates to them.

- Fetches albums in pages of 10.
- For each page it fires parallel cover art queries for all albums at the requested size (48 or 256 px), then renders the images off-screen with `memory-disk` caching.
- A batch is considered complete when every image in the page has either loaded or errored (both outcomes advance the counter equally).
- After a batch completes, the offset advances by the page size and the next batch begins.
- When a fetched page contains no albums, the `onLoadEnd` callback is called to signal that prefetching is finished.
