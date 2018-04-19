import { TAB } from "./utilities";
const TAB2 = TAB + TAB;

export function createOperation({ overrides }, name, args, returnType) {
  if (overrides.has(name)) return "";
  return `${TAB}${name} (\n${TAB2}${args.join(`,\n${TAB2}`)}\n${TAB}): ${returnType}`;
}
