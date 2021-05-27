import { TAB } from "./utilities";
const TAB2 = TAB + TAB;

export function createOperation({ overrides }, name, args, returnType) {
  if (overrides.has(name)) return "";
  return `${TAB}${name} (\n${TAB2}${args.join(`,\n${TAB2}`)}\n${TAB}): ${returnType}`;
}

export function createInput(name, fields) {
  return createGenericType("input", name, fields);
}

export function createType(name, fields) {
  return createGenericType("type", name, fields);
}

function createGenericType(typeName, name, fields) {
  if (!fields.length) {
    return "";
  }
  return `${TAB}${typeName} ${name} {\n${TAB2}${fields.join(`\n${TAB2}`)}\n${TAB}}`;
}
