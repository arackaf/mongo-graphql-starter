import { MongoIdType, StringType, StringArrayType, IntType, IntArrayType, FloatType, FloatArrayType, DateType, arrayOf } from "../dataTypes";
import { TAB } from "./utilities";

export default function createGraphqlTypeSchema(objectToCreate) {
  let fields = objectToCreate.fields || {};
  let relationships = objectToCreate.relationships || {};
  let name = objectToCreate.__name;
  let allQueryFields = [];
  let allFields = [];
  let allFieldsMutation = [];
  let TAB2 = TAB + TAB;

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
  ${Object.keys(relationships)
    .map(k => `${TAB}${k}: ${displayRelationshipSchemaValue(relationships[k])}`)
    .join(`\n${TAB}`)}
  }
  ${objectToCreate.table
    ? `
  type ${name}QueryResults {
    ${name}s: [${name}],
    Meta: QueryResultsMetadata
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
      case FloatArrayType:
        return "[Float]";
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

function displayRelationshipSchemaValue(value, useInputs) {
  if (value.__isArray) {
    return `[${value.type.__name}${useInputs ? "Input" : ""}]`;
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
    } else if (value === StringArrayType) {
      return [
        `${k}: [String]`,
        `${k}_PUSH: String`,
        `${k}_CONCAT: [String]`,
        `${k}_UPDATE: StringArrayUpdate`,
        `${k}_UPDATES: [StringArrayUpdate]`,
        `${k}_PULL: [String]`
      ];
    } else if (value === IntArrayType) {
      return [
        `${k}: [Int]`,
        `${k}_PUSH: Int`,
        `${k}_CONCAT: [Int]`,
        `${k}_UPDATE: IntArrayUpdate`,
        `${k}_UPDATES: [IntArrayUpdate]`,
        `${k}_PULL: [Int]`
      ];
    } else if (value === FloatArrayType) {
      return [
        `${k}: [Float]`,
        `${k}_PUSH: Float`,
        `${k}_CONCAT: [Float]`,
        `${k}_UPDATE: FloatArrayUpdate`,
        `${k}_UPDATES: [FloatArrayUpdate]`,
        `${k}_PULL: [Float]`
      ];
    }

    return [`${k}: String`];
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return [
        `${k}: [${value.type.__name}Input]`,
        `${k}_PUSH: ${value.type.__name}Input`,
        `${k}_CONCAT: [${value.type.__name}Input]`,
        `${k}_UPDATE: ${value.type.__name}ArrayMutationInput`,
        `${k}_UPDATES: [${value.type.__name}ArrayMutationInput]`,
        `${k}_PULL: ${value.type.__name}Filters`
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
    case FloatArrayType:
      result.push(...[`${fieldName}: [Float]`, `${fieldName}_in: [[Float]]`, `${fieldName}_contains: Float`]);
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
