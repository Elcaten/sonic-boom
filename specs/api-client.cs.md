---
import specs/utils.cs.md
---
# API & Queries

## API Instance (`useAPILogic`)

Creates a `SubsonicAPI` instance, memoized on credentials (server address, username, password). Returns `null` if any credential is missing.

- Uses a random 16-byte hex salt, reused across requests.
- All outgoing requests are logged (path + query params), with auth-related params (`v`, `c`, `f`, `u`, `t`, `s`) stripped from the logged URL.

## Query Definitions (`useQueriesLogic`)

Builds a collection of query option factories (for use with React Query), memoized on the API instance. Returns `null` if the API is not available.

| Query | Description |
|---|---|
| **albumList** | Paginated album list, ordered alphabetically by artist. |
| **streamUrl** | Stream URL for a given track ID. |
| **coverArtImage** | Cover art for an entity at a given size (32, 48, or 256 px). Checks the local image disk cache first; if a cached path exists, returns it directly. Fetches at 2× the requested size from the server. Disabled if no entity ID is provided; never goes stale. |
| **song** | Single song metadata by track ID. |
| **search** | Searches songs, albums, and artists (up to 100 songs, 5 albums, 5 artists). Client-side filters out albums and songs whose titles don't contain the query string (to avoid false matches on artist/album fields from the server). Disabled when the query is empty. |
| **album** | Album details by ID. |
| **artists** | Full artist index. |
| **artist** | Single artist details by ID. |

## Prefetch (`usePrefetchQueries`)

Bulk-prefetches the entire library into the React Query cache. Exposes a `trigger` function and a `progress` state (`{ title, progressPercentage }`).

Sequence on trigger:

1. Clears the existing query cache.
2. Fetches the full artist list.
3. Fetches each artist's details in batches of 3 (300 ms delay between batches), reporting progress as "Artists X%".
4. Fetches each album's details (collected from all artist responses) in batches of 5 (300 ms delay), reporting progress as "Albums X%".
5. Logs counts of any failed artist or album fetches.
