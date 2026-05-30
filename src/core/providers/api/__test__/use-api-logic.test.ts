import { useAPILogic } from "../api-context";

import { AuthState } from "@/features/auth/auth.types";
import { appLogger } from "@/shared/lib/logger/app-logger";
import * as Crypto from "expo-crypto";
import { SubsonicAPI } from "subsonic-api";

// Mock expo-crypto to return deterministic bytes
jest.mock("expo-crypto", () => ({
  getRandomBytes: jest.fn(
    () => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
  ),
}));

// Mock SubsonicAPI
const mockSubsonicAPIInstance = { _isMockAPI: true };
jest.mock("subsonic-api", () => ({
  SubsonicAPI: jest.fn().mockImplementation(() => mockSubsonicAPIInstance),
}));

// Mock app-logger
jest.mock("@/utils/app-logger", () => ({
  appLogger: {
    API: { info: jest.fn(), error: jest.fn() },
  },
}));

// Mock useMemo to call the factory function directly so we can test the hook logic without React renderer
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useMemo: (fn: () => unknown) => fn(),
}));

const makeAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  serverAddress: "https://music.example.com",
  username: "testuser",
  password: "testpass",
  isLoading: false,
  ...overrides,
});

describe("useAPILogic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when password is missing", () => {
    const authState = makeAuthState({ password: "" });
    const result = useAPILogic(authState);
    expect(result).toBeNull();
  }, 30000);

  it("returns null when username is missing", () => {
    const authState = makeAuthState({ username: "" });
    const result = useAPILogic(authState);
    expect(result).toBeNull();
  }, 30000);

  it("returns null when serverAddress is missing", () => {
    const authState = makeAuthState({ serverAddress: "" });
    const result = useAPILogic(authState);
    expect(result).toBeNull();
  }, 30000);

  it("returns null when all credentials are missing", () => {
    const authState = makeAuthState({ serverAddress: "", username: "", password: "" });
    const result = useAPILogic(authState);
    expect(result).toBeNull();
  }, 30000);

  it("returns a SubsonicAPI instance when credentials are complete", () => {
    const authState = makeAuthState();
    const result = useAPILogic(authState);
    expect(result).not.toBeNull();
    expect(SubsonicAPI).toHaveBeenCalledTimes(1);
  }, 30000);

  it("creates SubsonicAPI with correct url and auth config", () => {
    const authState = makeAuthState();
    useAPILogic(authState);
    const MockSubsonicAPI = SubsonicAPI as jest.MockedClass<typeof SubsonicAPI>;
    const callArgs = MockSubsonicAPI.mock.calls[0][0];
    expect(callArgs.url).toBe("https://music.example.com");
    expect(callArgs.auth).toEqual({ username: "testuser", password: "testpass" });
    expect(callArgs.reuseSalt).toBe(true);
  }, 30000);

  it("generates a salt from crypto random bytes", () => {
    const authState = makeAuthState();
    useAPILogic(authState);
    expect(Crypto.getRandomBytes).toHaveBeenCalledWith(16);
    const MockSubsonicAPI = SubsonicAPI as jest.MockedClass<typeof SubsonicAPI>;
    const callArgs = MockSubsonicAPI.mock.calls[0][0];
    // bytes [1..16] → hex: "0102030405060708090a0b0c0d0e0f10"
    expect(callArgs.salt).toMatch(/^[0-9a-f]{32}$/);
  }, 30000);

  it("custom fetch calls global fetch with the original params", async () => {
    const authState = makeAuthState();
    useAPILogic(authState);
    const MockSubsonicAPI = SubsonicAPI as jest.MockedClass<typeof SubsonicAPI>;
    const callArgs = MockSubsonicAPI.mock.calls[0][0];
    const customFetch = callArgs.fetch!;

    const mockFetch = jest.fn().mockResolvedValue(new Response());
    const originalFetch = global.fetch;
    global.fetch = mockFetch;

    const testUrl =
      "https://music.example.com/rest/getAlbumList?v=1.16.1&c=SonicBoom&f=json&u=testuser&t=abc123&s=salt123&size=10";

    await customFetch(testUrl as unknown as Request);

    // fetch is called with the original params (the URL stripping is only for logging)
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(testUrl);

    global.fetch = originalFetch;
  }, 30000);

  it("custom fetch logs the request info via appLogger", async () => {
    const authState = makeAuthState();
    useAPILogic(authState);
    const MockSubsonicAPI = SubsonicAPI as jest.MockedClass<typeof SubsonicAPI>;
    const callArgs = MockSubsonicAPI.mock.calls[0][0];
    const customFetch = callArgs.fetch!;

    const mockFetch = jest.fn().mockResolvedValue(new Response());
    global.fetch = mockFetch;

    await customFetch(
      "https://music.example.com/rest/getAlbumList?v=1.16.1&size=5" as unknown as Request,
    );

    expect(appLogger.API.info).toHaveBeenCalled();
  }, 30000);

  it("custom fetch handles invalid URL strings gracefully", async () => {
    const authState = makeAuthState();
    useAPILogic(authState);
    const MockSubsonicAPI = SubsonicAPI as jest.MockedClass<typeof SubsonicAPI>;
    const callArgs = MockSubsonicAPI.mock.calls[0][0];
    const customFetch = callArgs.fetch!;

    const mockFetch = jest.fn().mockResolvedValue(new Response());
    global.fetch = mockFetch;

    // Pass an invalid URL string - should log error and still call fetch
    await customFetch("not-a-valid-url" as unknown as Request);

    expect(appLogger.API.error).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith("not-a-valid-url");
  }, 30000);

  it("custom fetch passes through non-string params directly", async () => {
    const authState = makeAuthState();
    useAPILogic(authState);
    const MockSubsonicAPI = SubsonicAPI as jest.MockedClass<typeof SubsonicAPI>;
    const callArgs = MockSubsonicAPI.mock.calls[0][0];
    const customFetch = callArgs.fetch!;

    const mockFetch = jest.fn().mockResolvedValue(new Response());
    global.fetch = mockFetch;

    const requestObj = new Request("https://example.com");
    await customFetch(requestObj);

    // Should not log (no URL string to parse)
    expect(appLogger.API.info).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(requestObj);
  }, 30000);
});
