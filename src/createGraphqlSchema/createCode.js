import { MongoId, String, Int, Float, ArrayOf } from "./dataTypes";

const TAB = "  "; //two spaces

export function createObject(declaration, properties, offset = 1) {
  let propertyTab = TAB.repeat(offset),
    declarationTab = TAB.repeat(offset - 1);

  return `
${declarationTab}${declaration}
${createProperties(properties, offset)}
${declarationTab}}`.trim();
}

function createProperties(properties, offset) {
  let propertyTab = TAB.repeat(offset),
    nestedObjTab = TAB.repeat(offset + 1);
  return properties
    .map(({ name, value }) => {
      return `${propertyTab}${name}: ${Array.isArray(value)
        ? `[\n${nestedObjTab}${createObject("{", value, offset + 2)}\n${propertyTab}]`
        : displayMetadataValue(value)}`;
    })
    .join(",\n");
}

function displayMetadataValue(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `"[${value.type.__name}]"`;
    } else if (value.__isObject) {
      return `"${value.type.__name}"`;
    }
  }
}

function displaySchemaValue(value) {
  if (typeof value === "string") {
    return `${value == MongoId ? "String" : value}`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `"[${value.type.__name}]"`;
    } else if (value.__isObject) {
      return `"${value.type.__name}"`;
    }
  }
}

function queriesForField(fieldName, fieldType) {
  switch (fieldType) {
    case String:
      return [fieldName, `${fieldName}_contains`, `${fieldName}_startsWith`, `${fieldName}_endsWith`].map(p => `${p}: String`);
    case Int:
    case Float:
      return [fieldName, `${fieldName}_lt`, `${fieldName}_lte`, `${fieldName}_gt`, `${fieldName}_gte`].map(
        p => `${p}: ${fieldType == Int ? "Int" : "Float"}`
      );
  }
  return [];
}

export function createGraphqlSchema(objectToCreate) {
  let fields = objectToCreate.fields,
    name = objectToCreate.__name,
    allFields = [],
    TAB2 = TAB + TAB;

  Object.keys(fields).forEach(k => {
    allFields.push(...queriesForField(k, fields[k]));
  });

  let idField = Object.keys(fields).find(k => fields[k] === MongoId);

  return `export default \`

type ${name} {
${TAB}${Object.keys(fields)
    .map(k => `${k}: ${displaySchemaValue(fields[k])}`)
    .join(`\n${TAB}`)}
}

type Query {
${TAB}all${name}s(
${TAB2}${allFields.join(`,\n${TAB2}`)}
  ): [${name}]

${idField ? `${TAB}get${name}(${idField}: String): ${name}` : ""}
}

\`;`;
}
