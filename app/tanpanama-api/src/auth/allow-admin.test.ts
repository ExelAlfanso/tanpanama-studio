import { describe, expect, it } from "bun:test";
import { isAllowedAdmin } from "./allow-admin";

describe("isAllowedAdmin", () => {
  it("matches normalized emails in a comma-separated allowlist", () => {
    expect(
      isAllowedAdmin(
        "Editor@tanpanama.studio",
        " owner@tanpanama.studio, editor@tanpanama.studio "
      )
    ).toBe(true);
  });

  it("rejects missing, empty, and unlisted emails", () => {
    expect(isAllowedAdmin(undefined, "editor@tanpanama.studio")).toBe(false);
    expect(isAllowedAdmin("editor@tanpanama.studio", " ")).toBe(false);
    expect(
      isAllowedAdmin("visitor@example.com", "editor@tanpanama.studio")
    ).toBe(false);
  });
});
