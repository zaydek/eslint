import path from "node:path";

import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

const DEFAULT_SOURCE_ROOTS = ["src", "app/src"];
const DEFAULT_EXTENSIONS = ["js", "jsx", "ts", "tsx"];
const KEBAB_CASE_SEGMENT = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const kebabCaseSourceFilenamesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require kebab-case source filenames inside configured source roots." },
    messages: {
      filename: createRuleMessage(
        "Source filename `{{filename}}` must use lowercase kebab-case segments.",
        "Rename the file to kebab-case and update imports; dotted lowercase convention segments such as `.test` and `.stylex` are allowed.",
        "kebab-case-source-filenames",
      ),
    },
    schema: [
      {
        type: "object",
        properties: {
          sourceRoots: { type: "array", items: { type: "string" } },
          extensions: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const sourceRoots = normalizeRootOptions(options.sourceRoots ?? DEFAULT_SOURCE_ROOTS);
    const extensions = new Set(
      (options.extensions ?? DEFAULT_EXTENSIONS).map((extension) => normalizeExtension(extension)),
    );

    return {
      Program(node) {
        const filename = getContextFilename(context);
        if (!filename || filename.startsWith("<")) return;

        const normalizedFilename = normalizePath(filename);
        if (!isInSourceRoot(normalizedFilename, sourceRoots)) return;

        const basename = path.posix.basename(normalizedFilename);
        const extension = getExtension(basename);
        if (!extensions.has(extension)) return;
        if (isAllowedBasename(basename)) return;

        context.report({ node, messageId: "filename", data: { filename: basename } });
      },
    };
  },
};

function getContextFilename(context) {
  if (typeof context.filename === "string") return context.filename;
  if (typeof context.getFilename === "function") return context.getFilename();
  return null;
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function normalizeRootOptions(sourceRoots) {
  return sourceRoots
    .map((sourceRoot) => normalizePath(sourceRoot).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
}

function normalizeExtension(extension) {
  return extension.replace(/^\./, "").toLowerCase();
}

function isInSourceRoot(filename, sourceRoots) {
  if (sourceRoots.length === 0) return false;

  return sourceRoots.some(
    (sourceRoot) =>
      filename === sourceRoot ||
      filename.startsWith(`${sourceRoot}/`) ||
      filename.includes(`/${sourceRoot}/`),
  );
}

function getExtension(basename) {
  const segments = basename.split(".");
  if (segments.length < 2) return "";
  return segments.at(-1).toLowerCase();
}

function isAllowedBasename(basename) {
  const segments = basename.split(".");
  const nameSegments = segments.length > 1 ? segments.slice(0, -1) : segments;

  return nameSegments.every((segment) => KEBAB_CASE_SEGMENT.test(segment));
}
