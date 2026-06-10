import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

function isExportedDeclaration(node) {
  return node.parent?.type === "ExportNamedDeclaration";
}

function isComponentName(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function isTypePositionIdentifier(node) {
  const parent = node.parent;
  if (!parent) return false;
  if (parent.type === "TSTypeReference" && parent.typeName === node) return true;
  if (parent.type === "TSInterfaceHeritage" && parent.expression === node) return true;
  if (parent.type === "TSTypeQuery") return false;
  return false;
}

function shouldIgnoreTypeName(name) {
  return (
    name === "JSX" ||
    name === "React" ||
    name === "HTMLElement" ||
    name === "HTMLInputElement" ||
    name === "HTMLTextAreaElement" ||
    name === "SVGElement"
  );
}

export const associatedExportsRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require exported members to export associated local types used in their public surface.",
    },
    messages: {
      exportAssociated: createRuleMessage(
        "Exported member `{{member}}` exposes local type `{{typeName}}`.",
        "Export the associated type or stop exposing it through the exported member signature.",
        "associated-exports",
      ),
    },
    schema: [],
  },

  create(context) {
    const localTypes = new Set();
    const exportedTypes = new Set();
    const exportedMembers = [];

    function collectTypeReferences(node) {
      const exposedTypes = new Set();
      const sourceCode = context.sourceCode ?? context.getSourceCode();

      function visit(currentNode) {
        if (!currentNode || typeof currentNode.type !== "string") return;
        if (currentNode.type === "TSTypeAnnotation" || currentNode.type === "TSTypeReference") {
          for (const key of sourceCode.visitorKeys?.[currentNode.type] ??
            Object.keys(currentNode)) {
            const value = currentNode[key];
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value.type === "string") visit(value);
          }
          return;
        }
        if (currentNode.type === "Identifier" && isTypePositionIdentifier(currentNode)) {
          exposedTypes.add(currentNode.name);
        }
        for (const key of sourceCode.visitorKeys?.[currentNode.type] ?? Object.keys(currentNode)) {
          if (key === "body") continue;
          const value = currentNode[key];
          if (Array.isArray(value)) value.forEach(visit);
          else if (value && typeof value.type === "string") visit(value);
        }
      }

      visit(node);
      return exposedTypes;
    }

    function collectFunctionSurfaceTypes(node) {
      const exposedTypes = new Set();
      for (const param of node.params ?? []) {
        for (const typeName of collectTypeReferences(param.typeAnnotation))
          exposedTypes.add(typeName);
      }
      for (const typeName of collectTypeReferences(node.returnType)) exposedTypes.add(typeName);
      return exposedTypes;
    }

    function addExportedMember(node, name, exposedTypes) {
      exportedMembers.push({ node, name, exposedTypes });
    }

    return {
      TSTypeAliasDeclaration(node) {
        localTypes.add(node.id.name);
        if (!isExportedDeclaration(node)) return;
        exportedTypes.add(node.id.name);
        addExportedMember(node, node.id.name, collectTypeReferences(node.typeAnnotation));
      },

      TSInterfaceDeclaration(node) {
        localTypes.add(node.id.name);
        if (!isExportedDeclaration(node)) return;
        exportedTypes.add(node.id.name);
        const exposedTypes = collectTypeReferences(node.extends);
        for (const member of node.body.body) {
          for (const typeName of collectTypeReferences(member)) exposedTypes.add(typeName);
        }
        addExportedMember(node, node.id.name, exposedTypes);
      },

      FunctionDeclaration(node) {
        if (!isExportedDeclaration(node)) return;
        if (node.id?.name && isComponentName(node.id.name)) return;
        addExportedMember(node, node.id?.name ?? "<anonymous>", collectFunctionSurfaceTypes(node));
      },

      VariableDeclaration(node) {
        if (!isExportedDeclaration(node)) return;
        for (const declaration of node.declarations) {
          if (declaration.id.type !== "Identifier") continue;
          const init = declaration.init;
          if (init?.type !== "ArrowFunctionExpression" && init?.type !== "FunctionExpression")
            continue;
          addExportedMember(node, declaration.id.name, collectFunctionSurfaceTypes(init));
        }
      },

      "Program:exit"() {
        for (const member of exportedMembers) {
          for (const typeName of member.exposedTypes) {
            if (typeName === member.name) continue;
            if (
              !localTypes.has(typeName) ||
              exportedTypes.has(typeName) ||
              shouldIgnoreTypeName(typeName)
            )
              continue;
            context.report({
              node: member.node,
              messageId: "exportAssociated",
              data: { member: member.name, typeName },
            });
          }
        }
      },
    };
  },
};
