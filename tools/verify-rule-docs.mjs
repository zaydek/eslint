import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';

import { dormantRules, rules as publicRules, topicRules } from '../topics/index.mjs';

const ROOT = process.cwd();
const RULES_INDEX_PATH = path.join(ROOT, 'RULES.md');
const RULES_DIR = path.join(ROOT, 'RULES');
const MODE = process.argv[2] ?? 'all';
const TARGET_RULES = Object.fromEntries(
  [
    ...Object.values(topicRules).flatMap((topicRulesMap) => Object.entries(topicRulesMap)),
    ...Object.entries(dormantRules),
  ],
);

if (!['target', 'all'].includes(MODE)) {
  console.error('Usage: node tools/verify-rule-docs.mjs [target|all]');
  process.exit(1);
}

const linter = new Linter();
const failures = [];

const detailPaths = fs
  .readdirSync(RULES_DIR)
  .filter((name) => name.endsWith('.md'))
  .map((name) => path.join(RULES_DIR, name))
  .sort();

const examples = [
  ...extractExamples(RULES_INDEX_PATH, 'index'),
  ...detailPaths.flatMap((filePath) => extractExamples(filePath, 'detail')),
];

const examplesBySourceAndRule = groupExamplesBySourceAndRule(examples);
checkCompactIndexConsistency(examplesBySourceAndRule);
if (MODE === 'target') checkTargetRuleExamples(examples);
else checkAllRuleExamples(examples);

if (failures.length > 0) {
  console.error(`rule doc verification failed (${failures.length} issue${failures.length === 1 ? '' : 's'})`);
  for (const failure of failures) {
    console.error(`\n- ${failure.title}`);
    for (const line of failure.lines) console.error(`  ${line}`);
  }
  process.exitCode = 1;
} else {
  console.log(`rule doc ${MODE} verification ok (${examples.length} examples)`);
}

function extractExamples(filePath, sourceKind) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const lines = markdown.split('\n');
  const output = [];

  let currentRule = null;
  let pendingLabel = null;
  let activeFence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const ruleMatch = line.match(/^Rule: `agentic\/([^`]+)`/);
    if (ruleMatch) currentRule = ruleMatch[1];

    if (activeFence) {
      if (line.startsWith('```')) {
        output.push({
          filePath,
          sourceKind,
          ruleName: activeFence.ruleName,
          label: activeFence.label,
          expectation: activeFence.expectation,
          language: activeFence.language,
          code: activeFence.lines.join('\n').trim(),
          startLine: activeFence.startLine,
          options: getOptionsFromLabel(activeFence.label),
        });
        activeFence = null;
        pendingLabel = null;
        continue;
      }
      activeFence.lines.push(line);
      continue;
    }

    const labelMatch = line.match(/^(Valid(?:[^:]*)?|Invalid(?:[^:]*)?):\s*$/);
    if (labelMatch) {
      pendingLabel = {
        label: labelMatch[1],
        expectation: labelMatch[1].startsWith('Valid') ? 'valid' : 'invalid',
      };
      continue;
    }

    const fenceMatch = line.match(/^```([A-Za-z0-9_-]+)?\s*$/);
    if (fenceMatch && pendingLabel && currentRule) {
      activeFence = {
        ruleName: currentRule,
        label: pendingLabel.label,
        expectation: pendingLabel.expectation,
        language: fenceMatch[1] ?? '',
        lines: [],
        startLine: index + 2,
      };
    }
  }

  return output;
}

function getOptionsFromLabel(label) {
  const maxAxesMatch = label.match(/maxAxes:\s*(\d+)/);
  if (maxAxesMatch) return [{ maxAxes: Number(maxAxesMatch[1]) }];
  return [];
}

function groupExamplesBySourceAndRule(allExamples) {
  const groups = new Map();
  for (const example of allExamples) {
    const key = `${example.sourceKind}:${example.ruleName}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(example);
  }
  return groups;
}

function checkCompactIndexConsistency(groups) {
  for (const detailPath of detailPaths) {
    const ruleName = path.basename(detailPath, '.md');
    const detailExamples = groups.get(`detail:${ruleName}`) ?? [];
    const indexExamples = groups.get(`index:${ruleName}`) ?? [];

    if (indexExamples.length === 0) {
      addFailure(`RULES.md is missing examples for ${ruleName}`, [detailPath]);
      continue;
    }

    for (const expectation of ['valid', 'invalid']) {
      const detailExample = detailExamples.find((example) => example.expectation === expectation);
      const indexExample = indexExamples.find((example) => example.expectation === expectation);
      if (!detailExample || !indexExample) {
        addFailure(`Missing ${expectation} example for ${ruleName}`, [
          formatLocation(detailExample ?? indexExample ?? { filePath: detailPath, startLine: 1 }),
        ]);
        continue;
      }
      if (detailExample.code !== indexExample.code) {
        addFailure(`RULES.md ${expectation} example differs from RULES/${ruleName}.md`, [
          `index: ${formatLocation(indexExample)}`,
          `detail: ${formatLocation(detailExample)}`,
        ]);
      }
    }
  }
}

function checkTargetRuleExamples(allExamples) {
  for (const example of allExamples) {
    if (!TARGET_RULES[example.ruleName]) {
      addFailure(`Unknown documented rule ${example.ruleName}`, [formatLocation(example)]);
      continue;
    }

    const targetMessages = lintExample(example, {
      [example.ruleName]: TARGET_RULES[example.ruleName],
    });
    const targetRuleId = `agentic/${example.ruleName}`;
    const matchingTargetMessages = targetMessages.filter((message) => message.ruleId === targetRuleId);

    if (example.expectation === 'valid' && matchingTargetMessages.length > 0) {
      addFailure(`Valid example fails its target rule ${targetRuleId}`, [
        formatLocation(example),
        ...formatMessages(matchingTargetMessages),
      ]);
    }
    if (example.expectation === 'invalid' && matchingTargetMessages.length === 0) {
      addFailure(`Invalid example does not fail its target rule ${targetRuleId}`, [
        formatLocation(example),
        ...formatMessages(targetMessages),
      ]);
    }
  }
}

function checkAllRuleExamples(allExamples) {
  checkTargetRuleExamples(allExamples);

  for (const example of allExamples) {
    const targetRuleId = `agentic/${example.ruleName}`;
    const publicMessages = lintExample(example, publicRules, example.options);
    const unrelatedMessages = publicMessages.filter((message) => message.ruleId !== targetRuleId);

    if (example.expectation === 'valid' && publicMessages.length > 0) {
      addFailure(`Valid example fails public rule set`, [
        formatLocation(example),
        ...formatMessages(publicMessages),
      ]);
    }
    if (example.expectation === 'invalid' && unrelatedMessages.length > 0) {
      addFailure(`Invalid example also fails unrelated public rules`, [
        formatLocation(example),
        ...formatMessages(unrelatedMessages),
      ]);
    }
  }
}

function lintExample(example, ruleMap) {
  const filename = getFilename(example);
  const configuredRules = Object.fromEntries(
    Object.keys(ruleMap).map((ruleName) => [
      `agentic/${ruleName}`,
      ruleName === example.ruleName && example.options.length > 0
        ? ['error', ...example.options]
        : 'error',
    ]),
  );

  return linter.verify(
    example.code,
    [
      {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
          ecmaVersion: 2022,
          parser: tseslint.parser,
          parserOptions: {
            ecmaFeatures: { jsx: true },
            sourceType: 'module',
          },
        },
        plugins: {
          agentic: { rules: ruleMap },
        },
        rules: configuredRules,
      },
    ],
    { filename },
  );
}

function getFilename(example) {
  if (example.language === 'tsx' || example.code.includes('<')) return 'example.tsx';
  if (example.language === 'jsx') return 'example.jsx';
  if (example.language === 'js') return 'example.js';
  return 'example.ts';
}

function formatMessages(messages) {
  if (messages.length === 0) return ['no lint messages'];
  return messages.map(
    (message) =>
      `${message.line}:${message.column} ${message.ruleId ?? 'parser'} ${message.message}`,
  );
}

function formatLocation(example) {
  return `${path.relative(ROOT, example.filePath)}:${example.startLine}`;
}

function addFailure(title, lines) {
  failures.push({ title, lines });
}
