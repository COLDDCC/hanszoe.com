import { test } from "node:test";
import assert from "node:assert/strict";
import raw from "../src/data/canonNotes.json";
import { canonNoteSchema, type CanonNote } from "../src/lib/schema";
const source = {
  id: "s1",
  url: "https://example.org/vol5",
  title: "単行本第5巻 一問一答",
  organization: "講談社",
  checkedAt: "2026-10-14",
  fields: ["回答内容"],
};
const base = {
  id: "qa-sample",
  kind: "读者问答",
  topic: "形象设计",
  question: "韩吉的眼镜是必需的吗？",
  questionOriginal: "ハンジにメガネは必須ですか？",
  answer: "中文摘译内容。",
  answerOriginal: null,
  spoiler: "无",
  citation: {
    work: "「進撃の巨人」単行本第5巻",
    edition: "講談社 初版",
    publishedAt: { value: "2013-07", precision: "month" },
    section: "一問一答",
    page: null,
    language: "ja",
  },
  attribution: "translated",
  evidenceStatus: "verified",
  missingFields: [],
  sources: [source],
  sourceIds: ["s1"],
  relatedProductIds: [],
  createdAt: "2026-10-14",
  updatedAt: "2026-10-14",
  isDemo: false,
};
const note = (change: (n: CanonNote) => void) => {
  const value = canonNoteSchema.parse(structuredClone(base));
  change(value);
  return canonNoteSchema.safeParse(value);
};
test("每条作者补充必须有来源", () => {
  assert.equal(canonNoteSchema.safeParse(base).success, true);
  assert.equal(note((n) => (n.sources = [])).success, false);
  assert.equal(note((n) => (n.sourceIds = [])).success, false);
});
test("来源引用必须指向本条已填写的来源", () => {
  assert.equal(note((n) => (n.sourceIds = ["missing"])).success, false);
  assert.equal(
    note((n) => {
      n.sources.push({ ...source, id: "s1" });
    }).success,
    false,
  );
});
test("逐字引用需要原文与页码", () => {
  assert.equal(
    note((n) => {
      n.attribution = "direct";
    }).success,
    false,
  );
  assert.equal(
    note((n) => {
      n.attribution = "direct";
      n.answerOriginal = "原文引用。";
    }).success,
    false,
  );
  assert.equal(
    note((n) => {
      n.attribution = "direct";
      n.answerOriginal = "原文引用。";
      n.citation.page = "p. 72";
    }).success,
    true,
  );
});
test("二手转述在核对原始出处前只能标记部分待核实", () => {
  assert.equal(
    note((n) => {
      n.attribution = "secondhand";
      n.evidenceStatus = "verified";
      n.missingFields = ["原始出版物页码"];
    }).success,
    false,
  );
  assert.equal(
    note((n) => {
      n.attribution = "secondhand";
      n.evidenceStatus = "partial";
      n.missingFields = ["原始出版物页码"];
    }).success,
    true,
  );
});
test("问答必须有原问题，其他类型不得填写问题", () => {
  assert.equal(
    note((n) => {
      n.question = "  ";
    }).success,
    false,
  );
  assert.equal(
    note((n) => {
      n.kind = "设定资料";
      n.question = null;
      n.questionOriginal = null;
    }).success,
    true,
  );
  assert.equal(
    note((n) => {
      n.kind = "设定资料";
      n.question = null;
    }).success,
    false,
  );
});
test("状态、出处日期与收录日期必须一致", () => {
  for (const modify of [
    (n: CanonNote) => {
      n.evidenceStatus = "partial";
    },
    (n: CanonNote) => {
      n.missingFields = ["页码"];
    },
    (n: CanonNote) => {
      n.updatedAt = "2026-10-01";
    },
    (n: CanonNote) => {
      n.citation.publishedAt = { value: "2013-07-99", precision: "day" };
    },
  ])
    assert.equal(note(modify).success, false);
});
test("已收录条目逐条带可点击的 https 出处", () => {
  const notes = raw.map((n) => canonNoteSchema.parse(n));
  for (const n of notes) {
    assert.ok(n.citation.section.trim().length > 0, n.id + " 缺少章节");
    for (const id of n.sourceIds)
      assert.ok(
        n.sources.some((s) => s.id === id && s.url.startsWith("https://")),
        n.id + " 来源不是 https 或缺失",
      );
  }
});
