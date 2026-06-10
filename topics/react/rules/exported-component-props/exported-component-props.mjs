import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*$/;

export const exportedComponentPropsRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Prefer exported ComponentNameProps types for exported components." },
    messages: {
      exportedProps: createRuleMessage(
        "Exported component `{{name}}` does not use an exported `{{propsName}}` type.",
        "Export `{{propsName}}` and use it as the component props annotation.",
        "exported-component-props",
      ),
    },
    schema: [],
  },

  create(context) {
    const exportedTypes = new Set();
    const exportedComponents = [];

    function isExportedFunction(node) {
      return node.parent?.type === "ExportNamedDeclaration";
    }

    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration;
        if (declaration?.type === "TSTypeAliasDeclaration") {
          exportedTypes.add(declaration.id.name);
        }
      },

      FunctionDeclaration(node) {
        const name = node.id?.name;
        if (!name || !COMPONENT_NAME.test(name) || !isExportedFunction(node)) return;
        exportedComponents.push(node);
      },

      "Program:exit"() {
        for (const node of exportedComponents) {
          const name = node.id.name;
          const propsName = `${name}Props`;
          const firstParam = node.params[0];
          if (!firstParam) continue;
          if (!exportedTypes.has(propsName)) {
            context.report({ node, messageId: "exportedProps", data: { name, propsName } });
          }
        }
      },
    };
  },
};
