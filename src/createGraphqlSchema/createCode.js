import fs from "fs";
import path from "path";
import { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf } from "./dataTypes";

const TAB = "  "; //two spaces

export function createObject(declaration, properties, offset = 1) {
  let propertyTab = TAB.repeat(offset);
  let declarationTab = TAB.repeat(offset - 1);

  return `
${declarationTab}${declaration}
${createProperties(properties, offset)}
${declarationTab}}`.trim();
}

function createProperties(properties, offset) {
  let propertyTab = TAB.repeat(offset);
  let nestedObjTab = TAB.repeat(offset + 1);

  return properties
    .filter(prop => prop)
    .map(({ name, value, literal, definition }) => {
      return (
        propertyTab +
        (definition ||
          `${name}: ${Array.isArray(value) ? `${createObject(" {", value, offset + 1)}${propertyTab}` : displayMetadataValue(value, literal)}`)
      );
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
    return `${value == MongoIdType || value == DateType ? "String" : value}`;
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

function getMutations(k, fields) {
  let value = fields[k];

  if (typeof value === "object" && value.__isDate) {
    return [`${k}: String`];
  } else if (typeof value === "string") {
    if (value === "Int") {
      return [`${k}: Int`, `${k}_INC: Int`, `${k}_DEC: Int`];
    } else if (value === "Float") {
      return [`${k}: Float`, `${k}_INC: Int`, `${k}_DEC: Int`];
    }
    return [`${k}: String`];
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return [`${k}: [${value.type.__name}Input]`, `${k}_PUSH: ${value.type.__name}Input`, `${k}_CONCAT: [${value.type.__name}Input]`];
    } else if (value.__isLiteral) {
      return [`${k}: ${value.type}`];
    } else if (value.__isObject) {
      return [`${k}: ${value.type.__name}Input`, `${k}_UPDATE: ${value.type.__name}MutationInput`];
    }
  }
}

function queriesForField(fieldName, realFieldType) {
  if (typeof realFieldType === "object" && realFieldType.__isDate) {
    realFieldType = DateType;
  }
  let result = [];
  let fieldType = realFieldType === DateType || realFieldType === MongoIdType ? "String" : realFieldType;
  switch (realFieldType) {
    case StringType:
      result.push(...[`${fieldName}_contains`, `${fieldName}_startsWith`, `${fieldName}_endsWith`].map(p => `${p}: String`));
      break;
    case IntType:
    case FloatType:
    case DateType:
      result.push(...[`${fieldName}_lt`, `${fieldName}_lte`, `${fieldName}_gt`, `${fieldName}_gte`].map(p => `${p}: ${fieldType}`));
      break;
  }

  switch (realFieldType) {
    case MongoIdType:
    case StringType:
    case IntType:
    case FloatType:
    case DateType:
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

  let dateFields = Object.keys(fields).filter(k => fields[k] === DateType || (typeof fields[k] === "object" && fields[k].__isDate));

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

input ${name}MutationInput {
${TAB}${Object.keys(fields)
    .filter(k => k != "_id")
    .reduce((inputs, k) => (inputs.push(...getMutations(k, fields)), inputs), [])
    .join(`\n${TAB}`)}
}

input ${name}Sort {
${TAB}${Object.keys(fields)
    .map(k => `${k}: Int`)
    .join(`\n${TAB}`)}
}${objectToCreate.table
    ? `
    
input ${name}Filters {
${TAB}${allQueryFields.concat([`OR: [${name}Filters]`]).join(`\n${TAB}`)}
}`
    : ""}

\`;

${objectToCreate.table
    ? `
export const mutation = \`

${TAB}create${name}(
${TAB2}${[`${name}: ${name}Input`].join(`,\n${TAB2}`)}
  ): ${name}

${TAB}update${name}(
${TAB2}${[`_id: ${displaySchemaValue(fields._id)}`, `${name}: ${name}MutationInput`].join(`,\n${TAB2}`)}
  ): ${name}

${TAB}delete${name}(
${TAB2}${[`_id: String`]}
  ): Boolean

\`;


export const query = \`

${TAB}all${name}s(
${TAB2}${allQueryFields
        .concat([`OR: [${name}Filters]`, `SORT: ${name}Sort`, `SORTS: [${name}Sort]`, `LIMIT: Int`, `SKIP: Int`, `PAGE: Int`, `PAGE_SIZE: Int`])
        .concat(dateFields.map(f => `${f}_format: String`))
        .join(`,\n${TAB2}`)}
  ): [${name}]

${TAB}get${name}(
${TAB2}${[`_id: String`].concat(dateFields.map(f => `${f}_format: String`)).join(`,\n${TAB2}`)}
  ): ${name}

\`;

`
    : ""}
`;
}

export function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve(__dirname, "./resolverTemplate.js"), { encoding: "utf8" });
  return template.replace(/\${table}/g, objectToCreate.table).replace(/\${objName}/g, objectToCreate.__name);
}
