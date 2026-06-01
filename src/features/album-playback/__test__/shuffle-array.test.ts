import { shuffleArray } from "../lib/shuffle-array";

describe("shuffleArray", () => {
  it("returns an array with the same length as the input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
  });

  it("returns an array containing the same elements as the input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toEqual(expect.arrayContaining(input));
    expect(input).toEqual(expect.arrayContaining(result));
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });

  it("returns an empty array when given an empty array", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("returns a single-element array unchanged", () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  it("works with arrays of strings", () => {
    const input = ["a", "b", "c", "d"];
    const result = shuffleArray(input);
    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining(input));
  });

  it("works with arrays of objects", () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = shuffleArray(input);
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(input));
  });

  it("returns a new array reference, not the same reference", () => {
    const input = [1, 2, 3];
    const result = shuffleArray(input);
    expect(result).not.toBe(input);
  });
});
