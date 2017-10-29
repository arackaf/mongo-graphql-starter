import { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf } from "./dataTypes";

export function displaySchemaValue(value, useInputs) {
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

export function getMutations(k, fields) {
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

export function queriesForField(fieldName, realFieldType) {
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

  if (realFieldType.__isObject || realFieldType.__isArray) {
    result.push(`${fieldName}: ${realFieldType.type.__name}Filters`);
  }

  return result;
}
