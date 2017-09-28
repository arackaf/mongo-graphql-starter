import { MongoId } from "./dataTypes";

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

export function createGraphqlSchema(objectToCreate) {
  let fields = objectToCreate.fields;

  return `export default \`

type ${objectToCreate.__name} {
${TAB}${Object.keys(fields)
    .map(k => `${k}: ${displaySchemaValue(fields[k])}`)
    .join(`\n${TAB}`)}
}

\`;`;
}

//${properties.map(({ name, value }) => `${propertyTab}${name}: ${value}`).join(",\n")}
