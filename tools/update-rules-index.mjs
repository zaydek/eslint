import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const RULES_DIR = path.join(ROOT, 'RULES');
const RULES_INDEX_PATH = path.join(ROOT, 'RULES.md');
const TOPIC_ORDER = ['TypeScript', 'React', 'StyleX', 'Comments'];

const ruleDocs = fs
  .readdirSync(RULES_DIR)
  .filter((name) => name.endsWith('.md'))
  .map((name) => readRuleDoc(path.join(RULES_DIR, name)))
  .sort((left, right) => {
    const topicDelta = TOPIC_ORDER.indexOf(left.topic) - TOPIC_ORDER.indexOf(right.topic);
    if (topicDelta !== 0) return topicDelta;
    return left.title.localeCompare(right.title);
  });

const lines = [
  '# ESLint Rules',
  '',
  '`RULES.md` is the compact index. Detailed agent-facing rule docs live in `RULES/{slug}.md`.',
  '',
  'The `agentic/` prefix comes from the consumer plugin name; this package exports flat rule keys.',
  '',
  '## Table Of Contents',
  '',
];

for (const topic of TOPIC_ORDER) {
  const docs = ruleDocs.filter((doc) => doc.topic === topic);
  if (docs.length === 0) continue;
  lines.push(`- [${topic}](#${slugify(topic)})`);
  for (const doc of docs) {
    const suffix = doc.status.includes('disabled') ? ' — disabled' : '';
    lines.push(`  - [${doc.title}](#${slugify(doc.title)})${suffix}`);
  }
}

for (const topic of TOPIC_ORDER) {
  const docs = ruleDocs.filter((doc) => doc.topic === topic);
  if (docs.length === 0) continue;
  lines.push('', `## ${topic}`, '');

  for (const doc of docs) {
    const status = doc.status.includes('disabled') ? ' Disabled.' : '';
    lines.push(`### ${doc.title}`, '');
    lines.push(
      `Rule: \`agentic/${doc.ruleName}\`. Details: [RULES/${doc.ruleName}.md](RULES/${doc.ruleName}.md).${status}`,
      '',
    );
    appendExample(lines, 'Valid', doc.valid);
    appendExample(lines, 'Invalid', doc.invalid);
  }
}

fs.writeFileSync(RULES_INDEX_PATH, `${lines.join('\n').trimEnd()}\n`);

function readRuleDoc(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const ruleName = path.basename(filePath, '.md');
  return {
    filePath,
    ruleName,
    title: getMatch(markdown, /^# (.+)$/m),
    topic: getMatch(markdown, /^Topic: (.+)$/m),
    status: getMatch(markdown, /^Status: (.+)$/m),
    valid: getFirstExample(markdown, 'Valid'),
    invalid: getFirstExample(markdown, 'Invalid'),
  };
}

function getMatch(markdown, pattern) {
  const match = markdown.match(pattern);
  if (!match) throw new Error(`Missing ${pattern} in rule doc`);
  return match[1];
}

function getFirstExample(markdown, label) {
  const pattern = new RegExp(`^${label}(?:[^:]*)?:\\n\\n\\\`\\\`\\\`([A-Za-z0-9_-]+)?\\n([\\s\\S]*?)\\n\\\`\\\`\\\``, 'm');
  const match = markdown.match(pattern);
  if (!match) throw new Error(`Missing ${label} example`);
  return {
    language: match[1] ?? '',
    code: match[2].trim(),
  };
}

function appendExample(lines, label, example) {
  lines.push(`${label}:`, '');
  lines.push(`\`\`\`${example.language}`);
  lines.push(example.code);
  lines.push('```', '');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
