import { batchProcess, batchProcessWithDetails } from "../batch-process";

describe("batchProcess", () => {
  it(
    "resolves all fulfilled promises",
    async () => {
      const promises = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ];
      const results = await batchProcess({ promises });
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ status: "fulfilled", value: 1 });
      expect(results[1]).toEqual({ status: "fulfilled", value: 2 });
      expect(results[2]).toEqual({ status: "fulfilled", value: 3 });
    },
    30000
  );

  it(
    "handles rejected promises without throwing",
    async () => {
      const error = new Error("fail");
      const promises = [Promise.resolve(1), Promise.reject(error)];
      const results = await batchProcess({ promises });
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ status: "fulfilled", value: 1 });
      expect(results[1]).toEqual({ status: "rejected", reason: error });
    },
    30000
  );

  it(
    "returns empty array for empty input",
    async () => {
      const results = await batchProcess({ promises: [] });
      expect(results).toEqual([]);
    },
    30000
  );

  it(
    "calls onProgress after each batch",
    async () => {
      const progressCalls: { completed: number; total: number }[] = [];
      const promises = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
        Promise.resolve(4),
        Promise.resolve(5),
      ];

      await batchProcess({
        promises,
        pageSize: 2,
        onProgress: ({ completed, total }) => {
          progressCalls.push({ completed, total });
        },
      });

      // 5 items with pageSize 2 → batches of [2, 2, 1] → 3 progress callbacks
      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[0]).toEqual({ completed: 2, total: 5 });
      expect(progressCalls[1]).toEqual({ completed: 4, total: 5 });
      expect(progressCalls[2]).toEqual({ completed: 5, total: 5 });
    },
    30000
  );

  it(
    "passes accumulated results to onProgress",
    async () => {
      const progressResults: PromiseSettledResult<number>[][] = [];
      const promises = [Promise.resolve(1), Promise.resolve(2)];

      await batchProcess({
        promises,
        pageSize: 1,
        onProgress: ({ results }) => {
          progressResults.push([...results]);
        },
      });

      expect(progressResults[0]).toHaveLength(1);
      expect(progressResults[1]).toHaveLength(2);
    },
    30000
  );

  it(
    "does not call onProgress when no callback is provided",
    async () => {
      // Should not throw
      const results = await batchProcess({
        promises: [Promise.resolve(1)],
      });
      expect(results).toHaveLength(1);
    },
    30000
  );

  it(
    "respects custom pageSize",
    async () => {
      const progressCalls: number[] = [];
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(i)
      );

      await batchProcess({
        promises,
        pageSize: 5,
        onProgress: ({ completed }) => progressCalls.push(completed),
      });

      // 10 items with pageSize 5 → 2 batches → 2 progress callbacks
      expect(progressCalls).toEqual([5, 10]);
    },
    30000
  );

  it(
    "processes a single batch without delay when only one batch exists",
    async () => {
      const promises = [Promise.resolve("a"), Promise.resolve("b")];
      const results = await batchProcess({ promises, pageSize: 10, delayMs: 100 });
      expect(results).toHaveLength(2);
    },
    30000
  );

  it(
    "applies delay between batches when delayMs is set",
    async () => {
      const start = Date.now();
      const promises = Array.from({ length: 4 }, (_, i) => Promise.resolve(i));

      await batchProcess({ promises, pageSize: 2, delayMs: 50 });

      const elapsed = Date.now() - start;
      // Should have waited at least once (50ms) between two batches
      expect(elapsed).toBeGreaterThanOrEqual(40);
    },
    30000
  );
});

describe("batchProcessWithDetails", () => {
  it(
    "returns correct counts for all fulfilled promises",
    async () => {
      const promises = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ];
      const details = await batchProcessWithDetails({ promises });

      expect(details.total).toBe(3);
      expect(details.successCount).toBe(3);
      expect(details.failureCount).toBe(0);
      expect(details.successful).toEqual([1, 2, 3]);
      expect(details.failed).toEqual([]);
    },
    30000
  );

  it(
    "returns correct counts for mixed fulfilled and rejected promises",
    async () => {
      const error = new Error("oops");
      const promises = [
        Promise.resolve("ok"),
        Promise.reject(error),
        Promise.resolve("also ok"),
      ];
      const details = await batchProcessWithDetails({ promises });

      expect(details.total).toBe(3);
      expect(details.successCount).toBe(2);
      expect(details.failureCount).toBe(1);
      expect(details.successful).toEqual(["ok", "also ok"]);
      expect(details.failed).toEqual([error]);
    },
    30000
  );

  it(
    "returns correct counts when all promises reject",
    async () => {
      const err1 = new Error("e1");
      const err2 = new Error("e2");
      const promises = [Promise.reject(err1), Promise.reject(err2)];
      const details = await batchProcessWithDetails({ promises });

      expect(details.total).toBe(2);
      expect(details.successCount).toBe(0);
      expect(details.failureCount).toBe(2);
      expect(details.successful).toEqual([]);
      expect(details.failed).toEqual([err1, err2]);
    },
    30000
  );

  it(
    "returns empty results for empty input",
    async () => {
      const details = await batchProcessWithDetails({ promises: [] });

      expect(details.total).toBe(0);
      expect(details.successCount).toBe(0);
      expect(details.failureCount).toBe(0);
      expect(details.successful).toEqual([]);
      expect(details.failed).toEqual([]);
      expect(details.results).toEqual([]);
    },
    30000
  );

  it(
    "includes all settled results in the results field",
    async () => {
      const error = new Error("fail");
      const promises = [Promise.resolve(42), Promise.reject(error)];
      const details = await batchProcessWithDetails({ promises });

      expect(details.results).toHaveLength(2);
      expect(details.results[0]).toEqual({ status: "fulfilled", value: 42 });
      expect(details.results[1]).toEqual({ status: "rejected", reason: error });
    },
    30000
  );
});
