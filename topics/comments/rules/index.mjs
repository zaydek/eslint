import { commentCapitalizationRule } from './comment-capitalization/comment-capitalization.mjs';
import { todoFormatRule } from './todo-format/todo-format.mjs';

export const commentsRules = {
  'comment-capitalization': commentCapitalizationRule,
  'todo-format': todoFormatRule,
};
