import { verifySubsonicCredentials } from "../api";

const mockNavidromeSession = jest.fn().mockRejectedValue(new Error("Unauthorized"));

jest.mock("@/shared/api/api-context/create-subsonic-api", () => ({
  createSubsonicAPI: jest.fn(() => ({ navidromeSession: mockNavidromeSession })),
}));

describe("verifySubsonicCredentials", () => {
  it("should throw an error if fields are missing", async () => {
    await expect(
      verifySubsonicCredentials({ serverAddress: "", username: "", password: "" }),
    ).rejects.toThrow("Invalid credentials");
  });
});
