import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*$/;

const GROUPS = [
  { id: "setup", label: "setup hooks" },
  { id: "refs", label: "refs" },
  { id: "state", label: "state" },
  { id: "derived", label: "derived constants" },
  { id: "effects", label: "effects" },
  { id: "handlers", label: "handlers" },
  { id: "return", label: "return" },
];

const GROUP_INDEX = new Map(GROUPS.map((group, index) => [group.id, index]));

export const componentBodyLayoutRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require PascalCase function-declaration component bodies to use a predictable grouped layout.",
    },
    messages: {
      order: createRuleMessage(
        "Component `{{component}}` places `{{actual}}` after `{{previous}}`.",
        "Order component body groups as setup hooks, refs, state, derived constants, effects, handlers, then return.",
        "component-body-layout",
      ),
      spacing: createRuleMessage(
        "Component `{{component}}` must separate `{{previous}}` and `{{actual}}` with exactly one blank line.",
        "Insert or remove blank lines so different component body groups are separated by one blank line.",
        "component-body-layout",
      ),
    },
    schema: [],
  },

  create(context) {
    function checkComponent(node) {
      const component = node.id?.name;
      if (!component || !COMPONENT_NAME.test(component)) return;
      if (node.body?.type !== "BlockStatement") return;

      let previous = null;
      for (const statement of node.body.body) {
        const group = getStatementGroup(statement);
        if (group === null) {
          previous = null;
          continue;
        }

        const entry = { statement, group };
        if (previous && GROUP_INDEX.get(entry.group.id) < GROUP_INDEX.get(previous.group.id)) {
          context.report({
            node: entry.statement,
            messageId: "order",
            data: { component, actual: entry.group.label, previous: previous.group.label },
          });
        }

        if (previous && entry.group.id !== previous.group.id) {
          const blankLines = entry.statement.loc.start.line - previous.statement.loc.end.line - 1;
          if (blankLines !== 1) {
            context.report({
              node: entry.statement,
              messageId: "spacing",
              data: { component, actual: entry.group.label, previous: previous.group.label },
            });
          }
        }

        previous = entry;
      }
    }

    return {
      FunctionDeclaration(node) {
        checkComponent(node);
      },
    };
  },
};

function getStatementGroup(statement) {
  if (statement.type === "ReturnStatement") return getGroup("return");
  if (statement.type === "FunctionDeclaration") return getGroup("handlers");
  if (statement.type === "ExpressionStatement" && isEffectHookCall(statement.expression)) {
    return getGroup("effects");
  }
  if (statement.type !== "VariableDeclaration") return null;

  if (statement.declarations.some((declaration) => isRefHookCall(declaration.init))) {
    return getGroup("refs");
  }
  if (statement.declarations.some((declaration) => isStateHookCall(declaration.init))) {
    return getGroup("state");
  }
  if (statement.declarations.some((declaration) => isFunctionValue(declaration.init))) {
    return getGroup("handlers");
  }
  if (statement.declarations.some((declaration) => isSetupHookCall(declaration.init))) {
    return getGroup("setup");
  }
  if (statement.declarations.some((declaration) => isHandlerMapDeclaration(declaration))) {
    return getGroup("handlers");
  }
  return getGroup("derived");
}

function getGroup(id) {
  return GROUPS[GROUP_INDEX.get(id)];
}

function isFunctionValue(node) {
  return node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression";
}

function isRefHookCall(node) {
  return isHookCall(node, ["useRef"]);
}

function isStateHookCall(node) {
  return isHookCall(node, ["useReducer", "useState"]);
}

function isEffectHookCall(node) {
  return isHookCall(node, ["useEffect", "useInsertionEffect", "useLayoutEffect"]);
}

function isSetupHookCall(node) {
  if (!isHookCall(node)) return false;
  if (isRefHookCall(node) || isStateHookCall(node) || isEffectHookCall(node)) return false;
  if (isHookCall(node, ["useCallback"])) return false;
  return true;
}

function isHandlerMapDeclaration(declaration) {
  if (declaration.id.type !== "Identifier") return false;
  return declaration.id.name === "handlers" || declaration.id.name.endsWith("Handlers");
}

function isHookCall(node, hookNames = null) {
  if (node?.type !== "CallExpression") return false;
  const hookNameSet = hookNames ? new Set(hookNames) : null;
  const callee = node.callee;
  if (callee.type === "Identifier") {
    if (!callee.name.startsWith("use")) return false;
    return hookNameSet ? hookNameSet.has(callee.name) : true;
  }
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    callee.property.name.startsWith("use")
  ) {
    return hookNameSet ? hookNameSet.has(callee.property.name) : true;
  }
  return false;
}
