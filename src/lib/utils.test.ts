import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./utils";

describe("getErrorMessage", () => {
  it("uses Error.message", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("uses plain strings", () => {
    expect(getErrorMessage("nope")).toBe("nope");
  });

  it("reads message from error-like objects (e.g. Supabase errors)", () => {
    expect(getErrorMessage({ message: "row not found", code: "PGRST116" })).toBe("row not found");
  });

  it("falls back for unknown values", () => {
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage({}, "fallback")).toBe("fallback");
    expect(getErrorMessage(new Error(""), "fallback")).toBe("fallback");
  });
});
