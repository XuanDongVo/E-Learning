import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(__dirname, "../../../..");
const errorCodePath = path.join(
  repositoryRoot,
  "server",
  "src",
  "main",
  "java",
  "e_learning",
  "server",
  "common",
  "exception",
  "ErrorCode.java",
);

function readErrorCodes(): Set<string> {
  const source = readFileSync(errorCodePath, "utf8");
  const enumBody = source.slice(0, source.indexOf("    private final"));
  return new Set(
    [...enumBody.matchAll(/^\s{4}([A-Z][A-Z0-9_]*)\(/gm)].map(
      (match) => match[1],
    ),
  );
}

function readMessageCodes(locale: string): Set<string> {
  const messagePath = path.join(
    __dirname,
    "..",
    "..",
    "messages",
    locale,
    "error.json",
  );
  const messages = JSON.parse(readFileSync(messagePath, "utf8")) as {
    errors: Record<string, string>;
  };
  return new Set(Object.keys(messages.errors));
}

describe("ErrorCode translation parity", () => {
  it("translates every server ErrorCode in both supported locales", () => {
    const errorCodes = readErrorCodes();

    for (const locale of ["en", "vi"]) {
      expect(readMessageCodes(locale), `${locale}/error.json`).toEqual(
        new Set([...errorCodes, "UNKNOWN_ERROR"]),
      );
    }
  });
});
