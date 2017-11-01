import { MongoIdType, StringType, StringArrayType, IntType, IntArrayType, FloatType, DateType, arrayOf } from "../dataTypes";
import { TAB } from "./utilities";

export default function createGraphqlTypeSchema(objectToCreate) {
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
  ${Object.keys(fields)
    .map(k => `${TAB}${k}: ${displaySchemaValue(fields[k])}`)
    .join(`\n${TAB}`)}
  }
  ${objectToCreate.table
    ? `
  type ${name}QueryResults {
    ${name}s: [${name}]
  }

  type ${name}SingleQueryResult {
    ${name}: ${name}
  }

  type ${name}MutationResult {
    ${name}: ${name}
  }
`
    : ""}
  input ${name}Input {
  ${Object.keys(fields)
    .map(k => `${TAB}${k}: ${displaySchemaValue(fields[k], true)}`)
    .join(`\n${TAB}`)}
  }
  
  input ${name}MutationInput {
  ${Object.keys(fields)
    .filter(k => k != "_id")
    .reduce((inputs, k) => (inputs.push(...getMutations(k, fields).map(val => TAB + val)), inputs), [])
    .join(`\n${TAB}`)}
  }
  ${objectToCreate.__usedInArray
    ? `
  input ${name}ArrayMutationInput {
  ${TAB}index: Int,
  ${TAB}${name}: ${name}MutationInput
  }
  `
    : ""}
  input ${name}Sort {
  ${Object.keys(fields)
    .map(k => `${TAB}${k}: Int`)
    .join(`\n${TAB}`)}
  }
      
  input ${name}Filters {
  ${TAB}${allQueryFields.concat([`OR: [${name}Filters]`]).join(`\n${TAB}${TAB}`)}
  }
  
  \`;
  
  ${objectToCreate.table
    ? `
  export const mutation = \`
  
  ${TAB}create${name}(
  ${TAB2}${[`${name}: ${name}Input`].join(`,\n${TAB2}`)}
    ): ${name}MutationResult
  
  ${TAB}update${name}(
  ${TAB2}${[`_id: ${displaySchemaValue(fields._id)}`, `${name}: ${name}MutationInput`].join(`,\n${TAB2}${TAB}`)}
    ): ${name}MutationResult
  
  ${TAB}delete${name}(
  ${TAB2}${[`_id: String`]}
    ): Boolean
  
  \`;
  
  
  export const query = \`
  
  ${TAB}all${name}s(
  ${TAB2}${allQueryFields
        .concat([`OR: [${name}Filters]`, `SORT: ${name}Sort`, `SORTS: [${name}Sort]`, `LIMIT: Int`, `SKIP: Int`, `PAGE: Int`, `PAGE_SIZE: Int`])
        .concat(dateFields.map(f => `${f}_format: String`))
        .join(`,\n${TAB2}${TAB}`)}
    ): ${name}QueryResults
  
  ${TAB}get${name}(
  ${TAB2}${[`_id: String`].concat(dateFields.map(f => `${f}_format: String`)).join(`,\n${TAB2}${TAB}`)}
    ): ${name}SingleQueryResult
  
  \`;
  
  `
    : ""}
  `;
}

function displaySchemaValue(value, useInputs) {
  if (typeof value === "object" && value.__isDate) {
    return "String";
  } else if (typeof value === "string") {
    switch (value) {
      case StringArrayType:
        return "[String]";
      case IntArrayType:
        return "[Int]";
      default:
        return `${value == MongoIdType || value == DateType ? "String" : value}`;
    }
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
      return [
        `${k}: [${value.type.__name}Input]`,
        `${k}_PUSH: ${value.type.__name}Input`,
        `${k}_CONCAT: [${value.type.__name}Input]`,
        `${k}_UPDATE: ${value.type.__name}ArrayMutationInput`,
        `${k}_UPDATES: [${value.type.__name}ArrayMutationInput]`
      ];
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
    case StringArrayType:
      result.push(...[`${fieldName}: [String]`, `${fieldName}_in: [[String]]`, `${fieldName}_contains: String`]);
      break;
    case IntArrayType:
      result.push(...[`${fieldName}: [Int]`, `${fieldName}_in: [[Int]]`, `${fieldName}_contains: Int`]);
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

  if (realFieldType.__isObject || realFieldType.__isArray) {
    result.push(`${fieldName}: ${realFieldType.type.__name}Filters`);
  }

  return result;
}
