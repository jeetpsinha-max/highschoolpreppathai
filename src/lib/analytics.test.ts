import { describe, it, expect } from "vitest";
import { parseUserAgent, normalizeReferrer } from "./analytics";

describe("parseUserAgent", () => {
  it("detects Chrome on Windows desktop", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
    expect(parseUserAgent(ua)).toEqual({ browser: "Chrome", os: "Windows", device_type: "desktop" });
  });

  it("detects Safari on iPhone", () => {
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    expect(parseUserAgent(ua)).toEqual({ browser: "Safari", os: "iOS", device_type: "mobile" });
  });

  it("detects Edge before Chrome", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36 Edg/130.0";
    expect(parseUserAgent(ua).browser).toBe("Edge");
  });

  it("treats Android without 'Mobile' as a tablet", () => {
    const ua = "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/130.0 Safari/537.36";
    expect(parseUserAgent(ua)).toEqual({ browser: "Chrome", os: "Android", device_type: "tablet" });
  });
});

describe("normalizeReferrer", () => {
  it("keeps only the external hostname", () => {
    expect(normalizeReferrer("https://www.google.com/search?q=boarding+schools", "preppath.app")).toBe("google.com");
  });

  it("drops internal and empty referrers", () => {
    expect(normalizeReferrer("https://preppath.app/schools", "preppath.app")).toBeNull();
    expect(normalizeReferrer("https://www.preppath.app/", "preppath.app")).toBeNull();
    expect(normalizeReferrer("", "preppath.app")).toBeNull();
    expect(normalizeReferrer("not a url", "preppath.app")).toBeNull();
  });
});
