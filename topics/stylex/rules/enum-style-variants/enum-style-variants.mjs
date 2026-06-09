import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
import { getStylexCreateKeys, getStylexCreateObject } from '../../lib/ownership.mjs';

const STYLE_MAP_NAME_PATTERN = /^Map\w+ToStyles?$/;

export const enumStyleVariantsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `Map{Enum}ToStyle` records to cover a single style-key family that matches the enum variant set.',
    },
    messages: {
      styleValue: createRuleMessage(
        'Entry in `{{mapName}}` does not reference a StyleX key directly.',
        'Use a direct member expression such as `styles.RootWithLavender`.',
        'enum-style-variants',
      ),
      variantSuffix: createRuleMessage(
        'Style key `{{styleKey}}` does not end with enum member `{{variant}}`.',
        'Rename the style key so the suffix matches the enum member name.',
        'enum-style-variants',
      ),
      mixedFamily: createRuleMessage(
        'Style key `{{styleKey}}` does not share the map family stem `{{expectedStem}}`.',
        'Use one consistent stem for every style key in this enum style map.',
        'enum-style-variants',
      ),
      unknownStyleKey: createRuleMessage(
        'Style key `{{styleKey}}` is referenced by the enum style map but is not in this file\'s `stylex.create`.',
        'Add the key to `stylex.create`, move the map beside the styles, or remove the stale reference.',
        'enum-style-variants',
      ),
      missingVariant: createRuleMessage(
        'Enum style map is missing enum member `{{variant}}`.',
        'Add a `{{variant}}` entry or use an explicit `Exclude<>` map type when omission is intentional.',
        'enum-style-variants',
      ),
    },
    schema: [],
  },

  create(context) {
    const enumMembers = new Map();
    const styleKeys = new Set();
    const styleMaps = [];

    return {
      TSEnumDeclaration(node) {
        const members = node.body?.members ?? node.members ?? [];
        enumMembers.set(
          node.id.name,
          members.flatMap((member) => (member.id.type === 'Identifier' ? [member.id.name] : [])),
        );
      },

      CallExpression(node) {
        const objectNode = getStylexCreateObject(node);
        if (!objectNode) return;
        for (const key of getStylexCreateKeys(objectNode)) styleKeys.add(key);
      },

      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || !STYLE_MAP_NAME_PATTERN.test(node.id.name)) return;
        if (node.init?.type !== 'ObjectExpression') return;
        styleMaps.push({ mapName: node.id.name, node });
      },

      'Program:exit'() {
        for (const styleMap of styleMaps) {
          checkStyleMap(context, styleMap, enumMembers, styleKeys);
        }
      },
    };
  },
};

function checkStyleMap(context, { mapName, node }, enumMembers, styleKeys) {
  const entries = [];

  for (const property of node.init.properties) {
    if (property.type !== 'Property' || !property.computed) continue;
    if (
      property.key.type !== 'MemberExpression' ||
      property.key.object.type !== 'Identifier' ||
      property.key.property.type !== 'Identifier'
    ) {
      continue;
    }

    const enumName = property.key.object.name;
    const variant = property.key.property.name;

    if (
      property.value.type !== 'MemberExpression' ||
      property.value.computed ||
      property.value.property.type !== 'Identifier'
    ) {
      context.report({ node: property.value, messageId: 'styleValue', data: { mapName } });
      continue;
    }

    entries.push({ enumName, variant, styleKey: property.value.property.name, property });
  }

  let familyStem = null;
  for (const entry of entries) {
    if (!entry.styleKey.endsWith(entry.variant)) {
      context.report({
        node: entry.property.value,
        messageId: 'variantSuffix',
        data: { styleKey: entry.styleKey, variant: entry.variant },
      });
      continue;
    }

    const stem = entry.styleKey.slice(0, entry.styleKey.length - entry.variant.length);
    if (familyStem === null) {
      familyStem = stem;
    } else if (stem !== familyStem) {
      context.report({
        node: entry.property.value,
        messageId: 'mixedFamily',
        data: { styleKey: entry.styleKey, expectedStem: familyStem, mapName },
      });
    }

    if (styleKeys.size > 0 && !styleKeys.has(entry.styleKey)) {
      context.report({
        node: entry.property.value,
        messageId: 'unknownStyleKey',
        data: { styleKey: entry.styleKey },
      });
    }
  }

  const firstEntry = entries[0];
  if (!firstEntry || !enumMembers.has(firstEntry.enumName)) return;

  // An Exclude<> annotation narrows the key set on purpose, like
  // MapModalTypeToComponent excluding the None variant; skip completeness.
  if (annotationMentionsExclude(node.id.typeAnnotation)) return;

  const coveredVariants = new Set(entries.map((entry) => entry.variant));
  for (const variant of enumMembers.get(firstEntry.enumName)) {
    if (coveredVariants.has(variant)) continue;
    context.report({
      node: node.id,
      messageId: 'missingVariant',
      data: { mapName, enumName: firstEntry.enumName, variant },
    });
  }
}

function annotationMentionsExclude(node) {
  if (!node || typeof node !== 'object') return false;
  if (
    node.type === 'TSTypeReference' &&
    node.typeName.type === 'Identifier' &&
    node.typeName.name === 'Exclude'
  ) {
    return true;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;
    if (Array.isArray(value)) {
      if (value.some((child) => annotationMentionsExclude(child))) return true;
      continue;
    }
    if (annotationMentionsExclude(value)) return true;
  }

  return false;
}
