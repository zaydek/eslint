import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

const MAP_NAME_PATTERN = /^Map[A-Z][A-Za-z0-9]*To[A-Z][A-Za-z0-9]*$/;
const OPEN_KEY_NAMES = new Set(["PropertyKey"]);

export const mapRecordNamesRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require Record constants over closed sets to be named `Map{Key}To{Value}` and vice versa.",
    },
    messages: {
      recordNeedsMapName: createRuleMessage(
        "Record `{{name}}` is keyed by a closed set but is not named `Map{Key}To{Value}`.",
        "Rename the constant to the `Map{Key}To{Value}` form.",
        "map-record-names",
      ),
      mapNeedsRecord: createRuleMessage(
        "`{{name}}` is named like a map but has no type annotation declaring its key set.",
        "Annotate it with `Record<Enum, Value>` or a named mapped type.",
        "map-record-names",
      ),
      mapNeedsClosedKey: createRuleMessage(
        "`{{name}}` is named like a map but its `Record` key is an open set.",
        "Key it by an enum, literal union, or template literal type.",
        "map-record-names",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;

        const name = node.id.name;
        const annotation = node.id.typeAnnotation?.typeAnnotation;
        const keyType = getRecordKeyType(annotation);
        const isMapName = /^Map[A-Z]/.test(name);

        if (keyType && isClosedSetKeyType(keyType)) {
          if (!MAP_NAME_PATTERN.test(name)) {
            context.report({ node: node.id, messageId: "recordNeedsMapName", data: { name } });
          }
          return;
        }

        if (!isMapName) return;

        // Named annotations such as `BoardActionHandlerMap` (the mapped form
        // handler-map-alignment steers toward) declare their key set
        // elsewhere; give them the benefit of the doubt without type info.
        if (!annotation) {
          context.report({ node: node.id, messageId: "mapNeedsRecord", data: { name } });
          return;
        }
        if (keyType) {
          context.report({ node: node.id, messageId: "mapNeedsClosedKey", data: { name } });
        }
      },
    };
  },
};

function getRecordKeyType(typeNode) {
  if (typeNode?.type !== "TSTypeReference") return null;
  if (typeNode.typeName.type !== "Identifier" || typeNode.typeName.name !== "Record") return null;
  const typeArguments = typeNode.typeArguments ?? typeNode.typeParameters;
  return typeArguments?.params[0] ?? null;
}

function isClosedSetKeyType(keyType) {
  if (keyType.type === "TSTypeReference") {
    if (keyType.typeName.type !== "Identifier") return false;
    return !OPEN_KEY_NAMES.has(keyType.typeName.name);
  }
  if (keyType.type === "TSUnionType") {
    return keyType.types.every((memberType) => memberType.type === "TSLiteralType");
  }
  return keyType.type === "TSTemplateLiteralType";
}
