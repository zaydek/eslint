import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const RULES_DIR = path.join(ROOT, "RULES");
const RULES_INDEX_PATH = path.join(ROOT, "RULES.md");
const TOPIC_ORDER = ["TypeScript", "React", "StyleX", "Comments"];

const ruleDocs = fs
  .readdirSync(RULES_DIR)
  .filter((name) => name.endsWith(".md"))
  .map((name) => readRuleDoc(path.join(RULES_DIR, name)))
  .sort((left, right) => {
    const topicDelta = TOPIC_ORDER.indexOf(left.topic) - TOPIC_ORDER.indexOf(right.topic);
    if (topicDelta !== 0) return topicDelta;
    return left.title.localeCompare(right.title);
  });

const lines = [
  "# ESLint Rules",
  "",
  "`RULES.md` is the compact index. Detailed agent-facing rule docs live in `RULES/{topic}_{rule}.md`.",
  "",
  "The `agentic/` prefix comes from the consumer plugin name; this package exports flat rule keys.",
  "",
  "## Quick Setup",
  "",
  "Add the private package and peer dependencies from a downstream Zaydek repo:",
  "",
  "```json",
  "{",
  '  "devDependencies": {',
  '    "@zaydek/eslint": "file:../../eslint",',
  '    "@stylexjs/eslint-plugin": "^0.18.0",',
  '    "eslint": "^9.0.0",',
  '    "eslint-config-prettier": "^10.0.0",',
  '    "eslint-plugin-prettier": "^5.0.0",',
  '    "eslint-plugin-react-hooks": "^7.0.0",',
  '    "globals": "^17.0.0",',
  '    "typescript-eslint": "^8.0.0"',
  "  }",
  "}",
  "```",
  "",
  "Use the shared ESLint v9 flat config in `eslint.config.js`:",
  "",
  "```js",
  "export { default } from '@zaydek/eslint/config';",
  "```",
  "",
  "Then run `npm install` and `npm run lint` in the downstream repo.",
  "",
  "Diagnostics are written for agents:",
  "",
  "```text",
  "<Problem>",
  "Fix: <required action>",
  "See: ~/GitHub/zaydek/eslint/RULES/{topic}_{rule}.md",
  "```",
  "",
  "Follow the `See:` path first. Do not enable `dormantRules` downstream; those",
  "exist only so draft/disabled rules can remain documented and testable here.",
  "",
  "## Table Of Contents",
  "",
];

for (const topic of TOPIC_ORDER) {
  const docs = ruleDocs.filter((doc) => doc.topic === topic);
  if (docs.length === 0) continue;
  lines.push(`- [${topic}](#${slugify(topic)})`);
  for (const doc of docs) {
    const suffix = isOffStatus(doc.status) ? " — disabled" : "";
    lines.push(`  - [${doc.title}](#${slugify(doc.title)})${suffix}`);
  }
}

for (const topic of TOPIC_ORDER) {
  const docs = ruleDocs.filter((doc) => doc.topic === topic);
  if (docs.length === 0) continue;
  lines.push("", `## ${topic}`, "");

  for (const doc of docs) {
    const status = isOffStatus(doc.status) ? " Disabled." : "";
    lines.push(`### ${doc.title}`, "");
    lines.push(
      `Rule: \`agentic/${doc.ruleName}\`. Details: [RULES/${doc.docSlug}.md](RULES/${doc.docSlug}.md).${status}`,
      "",
    );
    appendExample(lines, "Valid", doc.valid);
    appendExample(lines, "Invalid", doc.invalid);
  }
}

fs.writeFileSync(RULES_INDEX_PATH, `${lines.join("\n").trimEnd()}\n`);

function readRuleDoc(filePath) {
  const markdown = fs.readFileSync(filePath, "utf8");
  return {
    filePath,
    docSlug: path.basename(filePath, ".md"),
    ruleName: getMatch(markdown, /^Rule: `agentic\/([^`]+)`$/m),
    title: getMatch(markdown, /^# (.+)$/m),
    topic: getMatch(markdown, /^Topic: (.+)$/m),
    status: getMatch(markdown, /^Status: (.+)$/m),
    valid: getFirstExample(markdown, "Valid"),
    invalid: getFirstExample(markdown, "Invalid"),
  };
}

function getMatch(markdown, pattern) {
  const match = markdown.match(pattern);
  if (!match) throw new Error(`Missing ${pattern} in rule doc`);
  return match[1];
}

function getFirstExample(markdown, label) {
  const pattern = new RegExp(
    `^${label}(?:[^:]*)?:\\n\\n\\\`\\\`\\\`([A-Za-z0-9_-]+)?\\n([\\s\\S]*?)\\n\\\`\\\`\\\``,
    "m",
  );
  const match = markdown.match(pattern);
  if (!match) throw new Error(`Missing ${label} example`);
  return { language: match[1] ?? "", code: match[2].trim() };
}

function appendExample(lines, label, example) {
  lines.push(`${label}:`, "");
  lines.push(`\`\`\`${example.language}`);
  lines.push(example.code);
  lines.push("```", "");
}

function isOffStatus(status) {
  return /\b(disabled|dormant)\b/i.test(status);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
