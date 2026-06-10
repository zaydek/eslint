import assert from "node:assert/strict";

import { expandOwnershipContract, parseOwnershipContract } from "./ownership-contract.mjs";

assert.deepEqual(
  expandOwnershipContract(`
Root{With{Bar|Baz}}, ?{IsSelected, HasIcon}
  Body
    BodyTitle
DotColor(color<string>)
`),
  [
    "Root",
    "RootWithBar",
    "RootWithBaz",
    "RootIsSelected",
    "RootHasIcon",
    "Body",
    "BodyTitle",
    "DotColor",
  ],
);

assert.deepEqual(
  expandOwnershipContract(`
Root{With{Bar|Baz}}, ?{IsSelected, HasIcon}
  Body
    BodyTitle
DotColor(color<string>)
`),
  [
    "Root",
    "RootWithBar",
    "RootWithBaz",
    "RootIsSelected",
    "RootHasIcon",
    "Body",
    "BodyTitle",
    "DotColor",
  ],
);

assert.deepEqual(messageIdsFor("Root{With{Bar|Baz}}?{IsSelected}"), ["missingOptionalSeparator"]);

assert.deepEqual(
  expandOwnershipContract(`
Dot
DotColor(color<string>)

Menu
  MenuItem?{IsDanger}
  MenuSep

Backdrop

Confirm
  ConfirmTitle
  ConfirmText
  ConfirmActions
    ConfirmActionsBtn{Is{Secondary|Danger}}
`),
  [
    "Dot",
    "DotColor",
    "Menu",
    "MenuItem",
    "MenuItemIsDanger",
    "MenuSep",
    "Backdrop",
    "Confirm",
    "ConfirmTitle",
    "ConfirmText",
    "ConfirmActions",
    "ConfirmActionsBtn",
    "ConfirmActionsBtnIsSecondary",
    "ConfirmActionsBtnIsDanger",
  ],
);

assert.deepEqual(messageIdsFor("Root{Is{Selected}?}"), ["trailingOptional"]);

assert.deepEqual(messageIdsFor("BodyReactsReact{Is{Add}?}"), ["trailingOptional"]);

assert.deepEqual(messageIdsFor("PadTopFlag{Is{High|Low}?}"), ["trailingOptional"]);

assert.deepEqual(messageIdsFor("Thumb{Is{Pdf|Link}?}"), ["trailingOptional"]);

assert.deepEqual(messageIdsFor("MenuItem{Is{Danger}?}"), ["trailingOptional"]);

assert.deepEqual(messageIdsFor("Foo{IsSelected}"), ["requiredBoolean"]);

assert.deepEqual(messageIdsFor("Foo{With{Bar}}"), ["singleValueUnion"]);

assert.deepEqual(messageIdsFor("Foo?{With{Bar}}"), ["singleValueUnion"]);

assert.deepEqual(messageIdsFor("Foo{Is?{A|B}}"), ["markerOptional"]);

assert.deepEqual(messageIdsFor("Foo?"), ["bareOptionalElement"]);

assert.deepEqual(messageIdsFor("Foo?{IsSelected}{With{Bar|Baz}}"), ["optionalFirstOrder"]);

assert.deepEqual(
  messageIdsFor(`
Root
  BodyCard          (layout override merged into child <Card>)
`),
  ["invalidLine"],
);

assert.deepEqual(
  parseOwnershipContract(`
StyleX ownership contract
Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.

  Root?{IsSelected}
    Body
`).errors,
  [],
);

console.log("stylex ownership contract tests ok");

function messageIdsFor(contract) {
  return parseOwnershipContract(contract).errors.map((error) => error.messageId);
}
