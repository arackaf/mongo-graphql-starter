import fs from "fs";
import path from "path";
import { MongoId, String, Int, Float, Date, ArrayOf } from "./dataTypes";

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
  let propertyTab = TAB.repeat(offset);
  let nestedObjTab = TAB.repeat(offset + 1);

  return properties
    .map(({ name, value, literal }) => {
      return `${propertyTab}${name}: ${Array.isArray(value)
        ? `${createObject(" {", value, offset + 1)}${propertyTab}`
        : displayMetadataValue(value, literal)}`;
    })
    .join(",\n");
}

function displayMetadataValue(value, literal) {
  if (literal) {
    return value;
  } else if (typeof value === "string") {
    return `"${value}"`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `"[${value.type.__name}]"`;
    } else if (value.__isLiteral) {
      return `"${value.type}"`;
    } else if (value.__isObject) {
      return `"${value.type.__name}"`;
    }
  }
}

function displaySchemaValue(value) {
  if (typeof value === "object" && value.__isDate) {
    return "String";
  } else if (typeof value === "string") {
    return `${value == MongoId || value == Date ? "String" : value}`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `[${value.type.__name}]`;
    } else if (value.__isLiteral) {
      return value.type;
    } else if (value.__isObject) {
      return `${value.type.__name}`;
    }
  }
}

function queriesForField(fieldName, realFieldType) {
  let result = [];
  let fieldType = realFieldType === Date ? "String" : realFieldType;
  switch (realFieldType) {
    case String:
      result.push(...[`${fieldName}_contains`, `${fieldName}_startsWith`, `${fieldName}_endsWith`].map(p => `${p}: String`));
      break;
    case Int:
    case Float:
    case Date:
      result.push(...[`${fieldName}_lt`, `${fieldName}_lte`, `${fieldName}_gt`, `${fieldName}_gte`].map(p => `${p}: ${fieldType}`));
      break;
  }

  switch (realFieldType) {
    case String:
    case Int:
    case Float:
    case Date:
      result.push(`${fieldName}: ${fieldType}`);
      result.push(`${fieldName}_in: [${fieldType}]`);
  }

  return result;
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
  let dateFields = Object.keys(fields).filter(k => fields[k] === Date || (typeof fields[k] === "object" && fields[k].__isDate));

  return `export const type = \`

type ${name} {
${TAB}${Object.keys(fields)
    .map(k => `${k}: ${displaySchemaValue(fields[k])}`)
    .join(`\n${TAB}`)}
}

input ${name}Sort {
${TAB}${Object.keys(fields)
    .map(k => `${k}: Int`)
    .join(`\n${TAB}`)}
}

input ${name}Filters {
${TAB}${allFields.concat([`OR: [${name}Filters]`]).join(`\n${TAB}`)}
}

\`;

export const query = \`

${TAB}all${name}s(
${TAB2}${allFields
    .concat([`OR: [${name}Filters]`, `SORT: ${name}Sort`, `SORTS: [${name}Sort]`, `LIMIT: Int`, `SKIP: Int`, `PAGE: Int`, `PAGE_SIZE: Int`])
    .concat(dateFields.map(f => `${f}_format: String`))
    .join(`,\n${TAB2}`)}
  ): [${name}]

${idField ? `${TAB}get${name}(${idField}: String): ${name}` : ""}

\`;


`;
}

export function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve("src/createGraphqlSchema/resolverTemplate.js", "."), { encoding: "utf8" });
  return template.replace(/\${table}/g, objectToCreate.table).replace(/\${objName}/g, objectToCreate.__name);
}
