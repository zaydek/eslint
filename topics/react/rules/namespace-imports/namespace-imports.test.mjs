import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { namespaceImportsRule } from "./namespace-imports.mjs";

const ruleTester = createRuleTester();

ruleTester.run("namespace-imports", namespaceImportsRule, {
  valid: [
    'import * as React from "react";',
    'import React from "react";',
    'import { useState } from "react";',
    'import * as stylex from "@stylexjs/stylex";',
    // Type-only imports carry no runtime shape.
    'import type { ReactNode } from "react";',
    // Other modules are out of scope.
    'import { useNavigate } from "react-router";',
  ],
  invalid: [
    { code: 'import stylex from "@stylexjs/stylex";', errors: [{ messageId: "namespaceOnly" }] },
    {
      code: 'import * as StyleX from "@stylexjs/stylex";',
      errors: [{ messageId: "canonicalName" }],
    },
  ],
});
