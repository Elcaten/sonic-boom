// auth.service.test.ts
import { verifySubsonicCredentials } from "../services/auth.service";

describe("verifySubsonicCredentials", () => {
  it("should throw an error if fields are missing", async () => {
    await expect(
      verifySubsonicCredentials({ serverAddress: "", username: "", password: "" }),
    ).rejects.toThrow("invalidCredentials");
  });
});
