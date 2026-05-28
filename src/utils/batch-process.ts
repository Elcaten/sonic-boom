interface ProgressCallback {
  (_: { completed: number; total: number; results: PromiseSettledResult<any>[] }): void;
}

interface BatchProcessParams<T> {
  promises: Promise<T>[];
  pageSize?: number;
  delayMs?: number;
  onProgress?: ProgressCallback;
}

type BatchProcessReturnType<T> = Promise<PromiseSettledResult<T>[]>;

interface BatchResult<T> {
  results: PromiseSettledResult<T>[];
  successful: T[];
  failed: any[];
  successCount: number;
  failureCount: number;
  total: number;
}

/**
 * Process with progress callback
 * @returns Array of all settled results
 */
export async function batchProcess<T>(params: BatchProcessParams<T>): BatchProcessReturnType<T> {
  const { promises, pageSize = 10, delayMs = 0, onProgress } = params;

  const results: PromiseSettledResult<T>[] = [];
  const total = promises.length;

  for (let i = 0; i < total; i += pageSize) {
    const batch = promises.slice(i, i + pageSize);
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);

    if (onProgress) {
      onProgress({ completed: i + batch.length, total, results });
    }

    // Add delay between batches (except for the last batch)
    if (i + pageSize < promises.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Get only successful results
 */
function getSuccessfulResults<T>(settledResults: PromiseSettledResult<T>[]): T[] {
  return settledResults
    .filter((result): result is PromiseFulfilledResult<T> => result.status === "fulfilled")
    .map((result) => result.value);
}

/**
 * Get only failed results
 */
function getFailedResults<T>(settledResults: PromiseSettledResult<T>[]): any[] {
  return settledResults
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason);
}

/**
 * Process promises and return detailed results
 */
export async function batchProcessWithDetails<T>(
  params: BatchProcessParams<T>
): Promise<BatchResult<T>> {
  const results = await batchProcess(params);

  const successful = getSuccessfulResults(results);
  const failed = getFailedResults(results);

  return {
    results,
    successful,
    failed,
    successCount: successful.length,
    failureCount: failed.length,
    total: results.length,
  };
}
