import { pluralize } from "../pluralize";

describe("pluralize", () => {
  it("uses singular form when count is 1", () => {
    expect(pluralize(1, "item")).toBe("1 item");
  });

  it("uses plural form when count is 0", () => {
    expect(pluralize(0, "item")).toBe("0 items");
  });

  it("uses plural form when count is greater than 1", () => {
    expect(pluralize(2, "item")).toBe("2 items");
  });

  it("uses a custom suffix when provided", () => {
    expect(pluralize(2, "box", "es")).toBe("2 boxes");
    expect(pluralize(1, "box", "es")).toBe("1 box");
  });

  it("handles large counts", () => {
    expect(pluralize(100, "item")).toBe("100 items");
  });

  it("handles negative counts", () => {
    expect(pluralize(-1, "item")).toBe("-1 items");
  });
});
