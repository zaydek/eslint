import { getStylexCreateObject, getStylexCreateKeys } from './stylex-ownership.mjs';

export function inferStylexOwnership(sourceCode, createCallNode) {
  const objectNode = getStylexCreateObject(createCallNode);
  const styleBindingName = getStyleBindingName(createCallNode);
  if (!objectNode || !styleBindingName) {
    return {
      entries: [],
      entriesByKey: new Map(),
      unresolved: new Set(),
    };
  }

  const styleKeys = new Set(getStylexCreateKeys(objectNode));
  const styleMetadata = getStyleMetadata(objectNode);
  const styledElements = collectStyledElements(
    sourceCode.ast,
    styleBindingName,
    styleKeys,
    styleMetadata,
  );
  const recordsByElement = new Map(styledElements.map((record) => [record.elementNode, record]));

  for (const record of styledElements) {
    record.parentRecord = getNearestStyledAncestor(record.elementNode, recordsByElement);
  }

  const keyEntries = [];
  const keyUseCounts = new Map();
  const unresolved = new Set();

  for (const record of styledElements) {
    const parentKey = record.parentRecord ? record.parentRecord.ownerKey : null;
    if (!record.ownerKey) {
      for (const unresolvedKey of record.unresolvedKeys) unresolved.add(unresolvedKey);
      continue;
    }

    for (const styleReference of record.styleReferences) {
      keyUseCounts.set(styleReference.key, (keyUseCounts.get(styleReference.key) ?? 0) + 1);
      keyEntries.push({
        key: styleReference.key,
        groupId: record.groupId,
        parentKey,
        token: styleReference.token,
      });
    }

    for (const unresolvedKey of record.unresolvedKeys) unresolved.add(unresolvedKey);
  }

  const entriesByKey = new Map();
  for (const entry of keyEntries) {
    if ((keyUseCounts.get(entry.key) ?? 0) !== 1) {
      unresolved.add(entry.key);
      continue;
    }
    entriesByKey.set(entry.key, entry);
  }

  return {
    entries: keyEntries,
    entriesByKey,
    unresolved,
  };
}

function getStyleBindingName(createCallNode) {
  const variableDeclarator = createCallNode.parent;
  if (
    variableDeclarator?.type === 'VariableDeclarator' &&
    variableDeclarator.id.type === 'Identifier' &&
    variableDeclarator.init === createCallNode
  ) {
    return variableDeclarator.id.name;
  }

  return null;
}

function getStyleMetadata(objectNode) {
  const metadata = new Map();

  for (const property of objectNode.properties) {
    if (property.type !== 'Property') continue;

    const key = getPropertyKeyName(property);
    if (!key) continue;

    metadata.set(key, {
      parameters: getFunctionParameterNames(property.value),
      states: getStateSelectors(property.value),
    });
  }

  return metadata;
}

function collectStyledElements(ast, styleBindingName, styleKeys, styleMetadata) {
  const styledElements = [];
  let nextGroupId = 0;

  traverseAst(ast, (node) => {
    if (node.type !== 'JSXSpreadAttribute') return;

    const callNode = node.argument;
    if (!isStylexPropsCall(callNode)) return;

    const references = extractStyleReferences(
      callNode.arguments,
      styleBindingName,
      styleKeys,
      styleMetadata,
    );

    if (references.styleReferences.length === 0 && references.unresolvedKeys.length === 0) return;

    const elementNode = node.parent?.parent;
    if (elementNode?.type !== 'JSXElement') return;

    const existingRecord = styledElements.find((record) => record.elementNode === elementNode);
    if (existingRecord) {
      existingRecord.styleReferences.push(...references.styleReferences);
      existingRecord.unresolvedKeys.push(...references.unresolvedKeys);
      existingRecord.ownerKey = getOwnerKey(existingRecord.styleReferences);
      return;
    }

    styledElements.push({
      elementNode,
      groupId: nextGroupId,
      ownerKey: getOwnerKey(references.styleReferences),
      parentRecord: null,
      styleReferences: references.styleReferences,
      unresolvedKeys: references.unresolvedKeys,
    });
    nextGroupId += 1;
  });

  return styledElements;
}

function extractStyleReferences(nodes, styleBindingName, styleKeys, styleMetadata) {
  const styleReferences = [];
  const unresolvedKeys = [];

  function collectReferences(node) {
    if (!node) return;

    if (node.type === 'ArrayExpression') {
      for (const element of node.elements) collectReferences(element);
      return;
    }

    if (node.type === 'ConditionalExpression') {
      collectReferences(node.consequent);
      collectReferences(node.alternate);
      return;
    }

    if (node.type === 'LogicalExpression') {
      collectReferences(node.left);
      collectReferences(node.right);
      return;
    }

    if (node.type === 'ChainExpression') {
      collectReferences(node.expression);
      return;
    }

    if (node.type === 'CallExpression') {
      const key = getStyleMemberKey(node.callee, styleBindingName);
      if (key && styleKeys.has(key)) {
        styleReferences.push({
          key,
          token: getStyleToken(key, styleMetadata),
        });
        return;
      }
      collectReferences(node.callee);
      for (const argument of node.arguments) collectReferences(argument);
      return;
    }

    const key = getStyleMemberKey(node, styleBindingName);
    if (key && styleKeys.has(key)) {
      styleReferences.push({
        key,
        token: getStyleToken(key, styleMetadata),
      });
      return;
    }

    if (isComputedStyleMember(node, styleBindingName)) {
      unresolvedKeys.push('?unresolved');
    }
  }

  for (const node of nodes) collectReferences(node);

  return {
    styleReferences: dedupeReferences(styleReferences),
    unresolvedKeys,
  };
}

function isStylexPropsCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'stylex' &&
    node.callee.property.type === 'Identifier' &&
    (node.callee.property.name === 'props' || node.callee.property.name === 'attrs')
  );
}

function getStyleMemberKey(node, styleBindingName) {
  if (
    node?.type === 'MemberExpression' &&
    !node.computed &&
    node.object.type === 'Identifier' &&
    node.object.name === styleBindingName &&
    node.property.type === 'Identifier'
  ) {
    return node.property.name;
  }

  return null;
}

function isComputedStyleMember(node, styleBindingName) {
  return (
    node?.type === 'MemberExpression' &&
    node.computed &&
    node.object.type === 'Identifier' &&
    node.object.name === styleBindingName
  );
}

function getStyleToken(key, styleMetadata) {
  const metadata = styleMetadata.get(key);
  const parameterSuffix =
    metadata?.parameters.length > 0 ? `(${metadata.parameters.join(', ')})` : '';
  const stateSuffix = metadata?.states.length > 0 ? `(${metadata.states.join(',')})` : '';
  return `${key}${parameterSuffix}${stateSuffix}`;
}

function getOwnerKey(styleReferences) {
  return styleReferences.find((styleReference) => styleReference.key)?.key ?? null;
}

function getNearestStyledAncestor(elementNode, recordsByElement) {
  let current = elementNode.parent;

  while (current) {
    if (current.type === 'JSXElement' && recordsByElement.has(current)) {
      return recordsByElement.get(current);
    }
    current = current.parent;
  }

  return null;
}

function dedupeReferences(styleReferences) {
  const seen = new Set();
  const deduped = [];

  for (const styleReference of styleReferences) {
    if (seen.has(styleReference.key)) continue;
    seen.add(styleReference.key);
    deduped.push(styleReference);
  }

  return deduped;
}

function getPropertyKeyName(property) {
  if (property.key.type === 'Identifier') return property.key.name;
  if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
    return property.key.value;
  }
  return null;
}

function getFunctionParameterNames(node) {
  if (node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression') return [];

  return node.params.map((param) => {
    if (param.type === 'Identifier') return param.name;
    if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
      return param.left.name;
    }
    return '?';
  });
}

function getStateSelectors(node) {
  const selectors = [];

  traverseAst(node, (candidate) => {
    if (candidate.type !== 'Property') return;

    const keyName = getPropertyKeyName(candidate);
    if (!keyName) return;
    if (!keyName.startsWith(':') && !keyName.startsWith('@')) return;

    selectors.push(keyName);
  });

  return Array.from(new Set(selectors));
}

function traverseAst(node, visitor) {
  const seen = new WeakSet();

  function visitNode(current) {
    if (!current || typeof current !== 'object') return;
    if (seen.has(current)) return;
    seen.add(current);

    visitor(current);

    for (const [key, value] of Object.entries(current)) {
      if (key === 'parent') continue;
      if (Array.isArray(value)) {
        for (const child of value) visitNode(child);
        continue;
      }
      visitNode(value);
    }
  }

  visitNode(node);
}
