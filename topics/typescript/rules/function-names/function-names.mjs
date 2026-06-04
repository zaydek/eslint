const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*$/;
const HOOK_NAME = /^use[A-Z]/;
const ALLOWED_RECURSIVE_NAME = 'recurse';
const ALLOWED_CONTRACT_NAMES = new Set(['preview']);
const VERB_PREFIXES = new Set([
  'add',
  'apply',
  'are',
  'begin',
  'blur',
  'build',
  'can',
  'cancel',
  'check',
  'clear',
  'close',
  'collect',
  'commit',
  'compare',
  'compute',
  'count',
  'create',
  'delete',
  'derive',
  'dispatch',
  'extract',
  'filter',
  'find',
  'focus',
  'format',
  'get',
  'handle',
  'has',
  'is',
  'join',
  'load',
  'map',
  'merge',
  'mount',
  'normalize',
  'open',
  'parse',
  'read',
  'remove',
  'render',
  'reset',
  'resolve',
  'save',
  'select',
  'send',
  'set',
  'should',
  'sort',
  'split',
  'start',
  'stop',
  'toggle',
  'transform',
  'update',
  'validate',
  'write',
]);

function hasVerbNounName(name) {
  const match = name.match(/^([a-z]+)[A-Z][A-Za-z0-9]*$/);
  return Boolean(match && VERB_PREFIXES.has(match[1]));
}

export const functionNamesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require non-component helper functions to use verb+noun names.',
    },
    messages: {
      verbNoun: 'Function `{{name}}` should use a verb+noun name.',
    },
    schema: [],
  },

  create(context) {
    return {
      FunctionDeclaration(node) {
        const name = node.id?.name;
        if (!name) return;
        if (ALLOWED_CONTRACT_NAMES.has(name)) return;
        if (COMPONENT_NAME.test(name) || HOOK_NAME.test(name) || name === ALLOWED_RECURSIVE_NAME) return;
        if (!hasVerbNounName(name)) {
          context.report({ node: node.id, messageId: 'verbNoun', data: { name } });
        }
      },
    };
  },
};
