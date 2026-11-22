import { describe, expect, it } from "vitest";
import { routing } from "./routing";
import viDashboard from "../messages/vi/student/dashboard.json";
import enDashboard from "../messages/en/student/dashboard.json";
import viLearning from "../messages/vi/student/learning.json";
import enLearning from "../messages/en/student/learning.json";
import viKnowledge from "../messages/vi/student/knowledge.json";
import enKnowledge from "../messages/en/student/knowledge.json";
import viProfile from "../messages/vi/student/profile.json";
import enProfile from "../messages/en/student/profile.json";
import viProgress from "../messages/vi/student/progress.json";
import enProgress from "../messages/en/student/progress.json";
import viVocabulary from "../messages/vi/student/vocabulary.json";
import enVocabulary from "../messages/en/student/vocabulary.json";

function messageKeys(value: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object"
      ? messageKeys(child as Record<string, unknown>, fullKey)
      : [fullKey];
  }).sort();
}

const namespaces = [
  ["dashboard", viDashboard, enDashboard],
  ["learning", viLearning, enLearning],
  ["knowledge", viKnowledge, enKnowledge],
  ["profile", viProfile, enProfile],
  ["progress", viProgress, enProgress],
  ["vocabulary", viVocabulary, enVocabulary],
] as const;

describe("Student core i18n", () => {
  it("uses explicit locale prefixes for Vietnamese and English", () => {
    expect(routing.locales).toEqual(["vi", "en"]);
    expect(routing.defaultLocale).toBe("vi");
    expect(routing.localePrefix).toBe("always");
  });

  it.each(namespaces)("%s has matching VI/EN message keys", (_name, vi, en) => {
    expect(messageKeys(vi)).toEqual(messageKeys(en));
  });

  it.each(namespaces)("%s has matching VI/EN ICU parameter names", (_name, vi, en) => {
    const getMessage = (messages: Record<string, unknown>, path: string): string =>
      path.split(".").reduce<unknown>((value, segment) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[segment]
          : undefined, messages) as string;

    const variables = (message: string): string[] =>
      [...message.matchAll(/\{\s*([a-zA-Z]\w*)\s*(?:,|\})/g)]
        .map((match) => match[1])
        .sort();

    for (const key of messageKeys(vi)) {
      expect(variables(getMessage(vi, key)), key).toEqual(
        variables(getMessage(en, key)),
      );
    }
  });
});
