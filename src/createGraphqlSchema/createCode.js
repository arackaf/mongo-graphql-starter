import fs from "fs";
import path from "path";
import { MongoId, String, Int, Float, Date, arrayOf } from "./dataTypes";

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

function displaySchemaValue(value, useInputs) {
  if (typeof value === "object" && value.__isDate) {
    return "String";
  } else if (typeof value === "string") {
    return `${value == MongoId || value == Date ? "String" : value}`;
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `[${value.type.__name}${useInputs ? "Input" : ""}]`;
    } else if (value.__isLiteral) {
      return value.type;
    } else if (value.__isObject) {
      return `${value.type.__name}${useInputs ? "Input" : ""}`;
    }
  }
}

function queriesForField(fieldName, realFieldType) {
  if (typeof realFieldType === "object" && realFieldType.__isDate) {
    realFieldType = Date;
  }
  let result = [];
  let fieldType = realFieldType === Date || realFieldType === MongoId ? "String" : realFieldType;
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
    case MongoId:
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
    allQueryFields = [],
    allFields = [],
    allFieldsMutation = [],
    TAB2 = TAB + TAB;

  Object.keys(fields).forEach(k => {
    allQueryFields.push(...queriesForField(k, fields[k]));
    allFields.push(`${k}: ${displaySchemaValue(fields[k])}`);
    allFieldsMutation.push(`${k}: ${displaySchemaValue(fields[k], true)}`);
  });

  let idField = Object.keys(fields).find(k => fields[k] === MongoId);
  let dateFields = Object.keys(fields).filter(k => fields[k] === Date || (typeof fields[k] === "object" && fields[k].__isDate));

  return `export const type = \`

type ${name} {
${TAB}${Object.keys(fields)
    .map(k => `${k}: ${displaySchemaValue(fields[k])}`)
    .join(`\n${TAB}`)}
}

input ${name}Input {
${TAB}${Object.keys(fields)
    .map(k => `${k}: ${displaySchemaValue(fields[k], true)}`)
    .join(`\n${TAB}`)}
}

input ${name}Sort {
${TAB}${Object.keys(fields)
    .map(k => `${k}: Int`)
    .join(`\n${TAB}`)}
}

input ${name}Filters {
${TAB}${allQueryFields.concat([`OR: [${name}Filters]`]).join(`\n${TAB}`)}
}

\`;

export const mutation = \`

${TAB}create${name}(
${TAB2}${allFieldsMutation.join(`,\n${TAB2}`)}
  ): ${name}

${TAB}update${name}(
${TAB2}${allFieldsMutation.join(`,\n${TAB2}`)}
  ): ${name}

${idField
    ? `${TAB}delete${name}(
${TAB2}${[`${idField}: String`]}
  ): Boolean`
    : ""}

\`;

export const query = \`

${TAB}all${name}s(
${TAB2}${allQueryFields
    .concat([`OR: [${name}Filters]`, `SORT: ${name}Sort`, `SORTS: [${name}Sort]`, `LIMIT: Int`, `SKIP: Int`, `PAGE: Int`, `PAGE_SIZE: Int`])
    .concat(dateFields.map(f => `${f}_format: String`))
    .join(`,\n${TAB2}`)}
  ): [${name}]

${idField
    ? `${TAB}get${name}(
${TAB2}${[`${idField}: String`].concat(dateFields.map(f => `${f}_format: String`)).join(`,\n${TAB2}`)}
  ): ${name}`
    : ""}

\`;


`;
}

export function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve("src/createGraphqlSchema/resolverTemplate.js", "."), { encoding: "utf8" });
  return template.replace(/\${table}/g, objectToCreate.table).replace(/\${objName}/g, objectToCreate.__name);
}
