import { authService } from "../services/auth.service";

describe("verifySubsonicCredentials", () => {
  it("should throw an error if fields are missing", async () => {
    await expect(
      authService.verifySubsonicCredentials({ serverAddress: "", username: "", password: "" }),
    ).rejects.toThrow("Invalid credentials");
  });
});
