/**
 * Severity Level list
 * It is used in configuration and message
 */
type none = 0;
type warning = 1;
type error = 2;
type info = 3;
export type TextlintRuleSeverityLevel = none | warning | error | info;
