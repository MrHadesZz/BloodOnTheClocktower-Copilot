import { describe, expect, it } from "vitest";
import { eventLabel } from "./model";
import { parseEntry } from "./parser";

const standard = { playerCount: 15, profile: "standard" as const };

describe("standard 7–15 player entry grammar", () => {
  it("accepts seat 15 while preserving the eight-player H0 bound", () => {
    expect(parseEntry("15 nom 15 @D1", standard)[0].payload).toEqual({
      kind: "nomination",
      nominator: 15,
      nominee: 15,
    });
    expect(() => parseEntry("15 nom 15 @D1")).toThrow("1到8");
    expect(() => parseEntry("16 nom 15 @D1", standard)).toThrow("1到15");
  });
  it("records standard pair, zero and numeric reports as claims", () => {
    const pair = parseEntry("15 ww 1/2 monk @N1", standard);
    expect(pair[1].payload).toMatchObject({
      kind: "claim",
      claimKind: "ability_report",
      role: "Washerwoman",
      targets: [1, 2],
      value: "Monk",
    });
    expect(parseEntry("4 lib zero @N1", standard)[1].payload).toMatchObject({
      role: "Librarian",
      value: 0,
    });
    expect(parseEntry("3 emp 2 @N1", standard)[1].payload).toMatchObject({
      role: "Empath",
      value: 2,
    });
    expect(
      eventLabel({
        payload: parseEntry("4 lib zero @N1", standard)[1].payload,
      }),
    ).toBe("4号报告零外来者");
  });
  it("keeps ability categories and H0 limitations explicit", () => {
    expect(() => parseEntry("4 ww 1/2 butler @N1", standard)).toThrow("类别");
    expect(() => parseEntry("4 inv 1/2 monk @N1", standard)).toThrow("爪牙");
    expect(() => parseEntry("4 inv 1/2 baron @N1")).toThrow("当前V0");
    expect(
      parseEntry("4 inv 1/2 baron @N1", standard)[1].payload,
    ).toMatchObject({
      role: "Investigator",
      value: "Baron",
    });
  });
});
