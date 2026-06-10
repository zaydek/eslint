import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { articulatedObjectContractsRule } from "./articulated-object-contracts.mjs";

const ruleTester = createRuleTester();

ruleTester.run("articulated-object-contracts", articulatedObjectContractsRule, {
  valid: [
    `
type EditableTitleProps = {
  /** Current committed title text shown when the control is not editing. */
  value: string;
  /** Called when the component requests entering or leaving edit mode. */
  onEditingChange: (isEditing: boolean) => void;
};
`,
    `
type LoadBoardArgs = {
  /** Board identifier to load. */
  boardId: string;
  /** Whether archived stickies should be included. */
  shouldIncludeArchived?: boolean;
};
`,
    `
type LoadBoardReturnItem = {
  /** Sticky identifier. */
  id: string;
};
`,
    `
type TreeNodeBase = {
  /** Stable tree node identifier. */
  id: string;
};

type IdeaNode = {
  /** Idea node label. */
  label: string;
};

type AxisTreeNode = TreeNodeBase & {
  /** Tree node category. */
  nodeKind: "axis";
  /** Manifest node kind represented by this axis. */
  kind: "version";
  /** Direct version count. */
  count: number;
  /** Idea nodes grouped under this axis. */
  nodes: IdeaNode[];
};
`,
    `
type LocalData = {
  /** Stable local identifier. */
  id: string;
  /** Human-readable label. */
  label: string;
};
`,
    "type EmptyProps = {};",
  ],
  invalid: [
    {
      code: `
type EditableTitleProps = {
  value: string;
};
`,
      errors: [{ messageId: "missingComment" }],
    },
    {
      code: `
type LoadBoardArgs = {
  boardId: string;
  /** Whether archived stickies should be included. */
  shouldIncludeArchived?: boolean;
};
`,
      errors: [{ messageId: "missingComment" }],
    },
    {
      code: `
/** Props for EditableTitle. */
type EditableTitleProps = {
  value: string;
};
`,
      errors: [{ messageId: "missingComment" }],
    },
    {
      code: `
type GetBoardReturnItem = {
  /** Sticky identifier. */
  id: string;

  label: string;
};
`,
      errors: [{ messageId: "missingComment" }],
    },
    {
      code: `
type TreeNodeBase = {
  /** Stable tree node identifier. */
  id: string;
};

type IdeaNode = {
  /** Idea node label. */
  label: string;
};

type AxisTreeNode = TreeNodeBase & {
  nodeKind: "axis";
  kind: "version";
  count: number;
  nodes: IdeaNode[];
};
`,
      errors: [
        { messageId: "missingComment" },
        { messageId: "missingComment" },
        { messageId: "missingComment" },
        { messageId: "missingComment" },
      ],
    },
    {
      code: `
type LocalData = {
  id: string;
};
`,
      errors: [{ messageId: "missingComment" }],
    },
  ],
});
