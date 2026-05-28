import { formatDuration } from "../format-duration";

describe("formatDuration", () => {
  it("formats seconds only (less than 1 minute)", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(59)).toBe("0:59");
  });

  it("formats minutes and seconds (less than 1 hour)", () => {
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(61)).toBe("1:01");
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(599)).toBe("9:59");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(7322)).toBe("2:02:02");
    expect(formatDuration(36000)).toBe("10:00:00");
  });

  it("pads seconds with leading zero when needed", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3605)).toBe("1:00:05");
  });

  it("pads minutes with leading zero when hours are present", () => {
    expect(formatDuration(3660)).toBe("1:01:00");
    expect(formatDuration(3600 + 5 * 60 + 3)).toBe("1:05:03");
  });

  it("truncates fractional seconds", () => {
    expect(formatDuration(90.9)).toBe("1:30");
    expect(formatDuration(3661.7)).toBe("1:01:01");
  });
});
