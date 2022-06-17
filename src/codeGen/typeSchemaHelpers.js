import {
  MongoIdType,
  MongoIdArrayType,
  StringType,
  StringArrayType,
  IntType,
  IntArrayType,
  FloatType,
  FloatArrayType,
  DateType,
  BoolType,
  JSONType
} from "../dataTypeConstants";
import { TAB } from "./utilities";
import { createOperation as createOperationOriginal, createInput, createType } from "./gqlSchemaHelpers";
import flatMap from "lodash.flatmap";

const TAB2 = TAB + TAB;

export default function createGraphqlTypeSchema(objectToCreate) {
  let fields = objectToCreate.fields || {};
  let relationships = objectToCreate.relationships || {};
  let relationshipEntries = Object.keys(relationships).map(k => [k, relationships[k]]);
  let name = objectToCreate.__name;
  let allQueryFields = [];
  let manualQueryArgs = [];
  let extras = objectToCreate.extras || {};
  let overrides = new Set(extras.overrides || []);
  let resolvedFields = objectToCreate.resolvedFields || {};
  let readonly = objectToCreate.readonly;

  const createOperation = createOperationOriginal.bind(null, { overrides });

  Object.keys(fields).forEach(k => {
    allQueryFields.push(...queriesForField(objectToCreate, k, fields[k]));
  });
  if (Array.isArray(objectToCreate.manualQueryArgs)) {
    manualQueryArgs.push(...objectToCreate.manualQueryArgs.map(arg => `${arg.name}: ${arg.type}`));
  }

  let dateFields = Object.keys(fields).filter(k => fields[k] === DateType || (typeof fields[k] === "object" && fields[k].__isDate));

  const createSchemaTypes = () =>
    `${[
      createType(name, [
        ...Object.keys(fields).map(k => `${k}: ${fieldType(objectToCreate, k, fields[k])}`),
        ...Object.keys(resolvedFields).map(k => `${k}: ${resolvedFields[k]}`),
        ...relationshipEntries.map(relationshipResolver)
      ]),
      ...(objectToCreate.table
        ? [
            createType(`${name}QueryResults`, [`${name}s: [${name}!]!`, `Meta: QueryResultsMetadata!`]),
            createType(`${name}SingleQueryResult`, [`${name}: ${name}`]),
            createType(`${name}MutationResult`, [`${name}: ${name}`, `success: Boolean!`, "Meta: MutationResultInfo!"]),
            createType(`${name}MutationResultMulti`, [`${name}s: [${name}]`, `success: Boolean!`, "Meta: MutationResultInfo!"]),
            createType(`${name}BulkMutationResult`, [`success: Boolean!`, "Meta: MutationResultInfo!"])
          ]
        : []),
      objectToCreate.hasMutableOneToManyRelationship
        ? createInput(`${name}InputLocal`, [
            ...Object.keys(fields).map(k => `${k}: ${fieldType(objectToCreate, k, fields[k], true)}`),
            ...Object.entries(relationships)
              .filter(([k, rel]) => !rel.readonly && !rel.oneToMany)
              .map(([k, rel]) => `${k}: ${relationshipType(rel, true)}`)
          ])
        : null,
      createInput(`${name}Input`, [
        ...Object.keys(fields).map(k => `${k}: ${fieldType(objectToCreate, k, fields[k], true)}`),
        ...Object.entries(relationships)
          .filter(([k, rel]) => !rel.readonly)
          .map(([k, rel]) => `${k}: ${relationshipType(rel, true)}`)
      ]),
      createInput(`${name}MutationInput`, [
        ...flatMap(
          Object.keys(fields).filter(k => k != "_id"),
          k => fieldMutations(k, fields)
        ),
        ...Object.entries(relationships)
          .filter(([k, rel]) => !rel.oneToMany && !rel.readonly)
          .map(([k, rel]) => (rel.__isArray ? `${k}_ADD: ${relationshipType(rel, true)}` : `${k}_SET: ${relationshipType(rel, true)}`))
      ]),
      objectToCreate.__usedInArray ? createInput(`${name}ArrayMutationInput`, ["index: Int", `Updates: ${name}MutationInput`]) : null,
      createInput(
        `${name}Sort`,
        Object.keys(fields)
          .filter(k => objectToCreate.fields[k] !== JSONType)
          .map(k => `${k}: Int`)
      ),
      createInput(`${name}Filters`, allQueryFields.concat([`OR: [${name}Filters]`]))
    ]
      .filter(s => s)
      .join("\n\n")}`;

  return {
    createSchemaTypes,
    createMutationType,
    createQueryType
  };

  function createMutationType() {
    let oneToManyForSingle = relationshipEntries
      .filter(([k, rel]) => rel.oneToMany && rel.fkField == "_id" && !rel.readonly)
      .map(([k, rel]) => `${k}_ADD: [${rel.type.__name}Input]`);

    let oneToManyForMulti = relationshipEntries
      .filter(([k, rel]) => rel.oneToMany && rel.fkField == "_id" && /Array/.test(rel.type.fields[rel.keyField]) && !rel.readonly)
      .map(([k, rel]) => `${k}_ADD: [${rel.type.__name}Input]`);

    let allMutations = [
      ...(!readonly
        ? [
            createOperation(`create${name}`, [`${name}: ${name}Input`], `${name}MutationResult`),
            createOperation(
              `update${name}`,
              [`_id: ${fieldType(null, null, fields._id)}`, `Updates: ${name}MutationInput`, ...oneToManyForSingle],
              `${name}MutationResult`
            ),
            createOperation(
              `update${name}s`,
              [`_ids: [String]`, `Updates: ${name}MutationInput`, ...oneToManyForMulti],
              `${name}MutationResultMulti`
            ),
            createOperation(`update${name}sBulk`, [`Match: ${name}Filters`, `Updates: ${name}MutationInput`], `${name}BulkMutationResult`),
            createOperation(`delete${name}`, [`_id: String`], "DeletionResultInfo")
          ]
        : [])
    ].filter(x => x);
    return allMutations.filter(s => s).join("\n\n");
  }

  function createQueryType() {
    let allOp = createOperation(
      `all${name}s`,
      allQueryFields
        .concat([`OR: [${name}Filters]`, `SORT: ${name}Sort`, `SORTS: [${name}Sort]`, `LIMIT: Int`, `SKIP: Int`, `PAGE: Int`, `PAGE_SIZE: Int`])
        .concat(dateFields.map(f => `${f}_format: String`))
        .concat(manualQueryArgs),
      `${name}QueryResults!`
    );

    let getOp = createOperation(
      `get${name}`,
      [`_id: String`].concat(dateFields.map(f => `${f}_format: String`).concat(manualQueryArgs)),
      `${name}SingleQueryResult!`
    );

    return [allOp, getOp].filter(s => s).join("\n\n");
  }
}

function fieldType(type, name, value, useInputs) {
  const nonNull = type && name ? type.nonNull[name] : false;
  const containsNonNull = type && name ? type.containsNonNull[name] : null;

  if (typeof value === "object" && value.__isDate) {
    return "String";
  } else if (typeof value === "string") {
    switch (value) {
      case StringArrayType:
        return `[String${containsNonNull ? "!" : ""}]${nonNull ? "!" : ""}`;
      case IntArrayType:
        return `[Int${containsNonNull ? "!" : ""}]${nonNull ? "!" : ""}`;
      case FloatArrayType:
        return `[Float${containsNonNull ? "!" : ""}]${nonNull ? "!" : ""}`;
      case MongoIdArrayType:
        return `[String${containsNonNull ? "!" : ""}]${nonNull ? "!" : ""}`;
      default:
        return `${value == MongoIdType || value == DateType ? "String" : value}${nonNull ? "!" : ""}`;
    }
  } else if (typeof value === "object") {
    if (value.__isArray) {
      return `[${value.type.__name}${useInputs ? (value.type.hasOneToManyRelationship ? "InputLocal" : "Input") : ""}]`;
    } else if (value.__isLiteral) {
      return value.type;
    } else if (value.__isObject) {
      return `${value.type.__name}${useInputs ? (value.type.hasOneToManyRelationship ? "InputLocal" : "Input") : ""}`;
    }
  }
}

function relationshipResolver([name, entry]) {
  let resolverArgs = entry.__isArray
    ? `(FILTER: ${entry.type.__name}Filters, LIMIT: Int, SKIP: Int, PAGE: Int, PAGE_SIZE: Int, SORT: ${entry.type.__name}Sort, SORTS: [${entry.type.__name}Sort], PREFER_LOOKUP: Boolean, DONT_PREFER_LOOKUP: Boolean)`
    : "";
  let resolvers = [name + resolverArgs + `: ${relationshipType(entry)}`];
  if (entry.__isArray) {
    resolvers.push(`    ${name}Meta(FILTER: ${entry.type.__name}Filters): QueryRelationshipResultsMetadata`);
  }

  return resolvers.join("\n");
}

function relationshipType(value, useInputs) {
  const modifier = useInputs ? "" : "!";
  if (value.__isArray) {
    return `[${value.type.__name}${useInputs ? "Input" : ""}${modifier}]${modifier}`;
  } else if (value.__isObject) {
    return `${value.type.__name}${useInputs ? "Input" : ""}`;
  }
}

function fieldMutations(k, fields) {
  let value = fields[k];

  if (typeof value === "object" && value.__isDate) {
    return [`${k}: String`];
  } else if (typeof value === "string") {
    if (value === BoolType) {
      return [`${k}: Boolean`];
    } else if (value === "Int") {
      return [`${k}: Int`, `${k}_INC: Int`, `${k}_DEC: Int`];
    } else if (value === "Float") {
      return [`${k}: Float`, `${k}_INC: Int`, `${k}_DEC: Int`];
    } else if (value === JSONType) {
      return [`${k}: JSON`];
    } else if (value === StringArrayType) {
      return [
        `${k}: [String]`,
        `${k}_PUSH: String`,
        `${k}_CONCAT: [String]`,
        `${k}_UPDATE: StringArrayUpdate`,
        `${k}_UPDATES: [StringArrayUpdate]`,
        `${k}_PULL: [String]`,
        `${k}_ADDTOSET: [String]`
      ];
    } else if (value === IntArrayType) {
      return [
        `${k}: [Int]`,
        `${k}_PUSH: Int`,
        `${k}_CONCAT: [Int]`,
        `${k}_UPDATE: IntArrayUpdate`,
        `${k}_UPDATES: [IntArrayUpdate]`,
        `${k}_PULL: [Int]`,
        `${k}_ADDTOSET: [Int]`
      ];
    } else if (value === FloatArrayType) {
      return [
        `${k}: [Float]`,
        `${k}_PUSH: Float`,
        `${k}_CONCAT: [Float]`,
        `${k}_UPDATE: FloatArrayUpdate`,
        `${k}_UPDATES: [FloatArrayUpdate]`,
        `${k}_PULL: [Float]`,
        `${k}_ADDTOSET: [Float]`
      ];
    } else if (value === MongoIdArrayType) {
      return [
        `${k}: [String]`,
        `${k}_PUSH: String`,
        `${k}_CONCAT: [String]`,
        `${k}_UPDATE: StringArrayUpdate`,
        `${k}_UPDATES: [StringArrayUpdate]`,
        `${k}_PULL: [String]`,
        `${k}_ADDTOSET: [String]`
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

function queriesForField(objectToCreate, fieldName, realFieldType) {
  if (objectToCreate.nonQueryable[fieldName]) {
    return [];
  }
  if (typeof realFieldType === "object" && realFieldType.__isDate) {
    realFieldType = DateType;
  }
  let result = [];
  let fieldType = realFieldType === DateType || realFieldType === MongoIdType ? "String" : realFieldType;
  switch (realFieldType) {
    case StringType:
      result.push(...[`${fieldName}_contains`, `${fieldName}_startsWith`, `${fieldName}_endsWith`, `${fieldName}_regex`].map(p => `${p}: String`));
      break;
    case IntType:
    case FloatType:
    case DateType:
      result.push(...[`${fieldName}_lt`, `${fieldName}_lte`, `${fieldName}_gt`, `${fieldName}_gte`].map(p => `${p}: ${fieldType}`));
      break;
    case IntArrayType:
    case FloatArrayType:
      let singleType = realFieldType == IntArrayType ? "Int" : "Float";
      result.push(`${fieldName}_count: Int`);
      result.push(...[`${fieldName}_lt`, `${fieldName}_lte`, `${fieldName}_gt`, `${fieldName}_gte`].map(p => `${p}: ${singleType}`));
      result.push(...[`${fieldName}_emlt`, `${fieldName}_emlte`, `${fieldName}_emgt`, `${fieldName}_emgte`].map(p => `${p}: ${singleType}`));
      result.push(
        `${fieldName}: [${singleType}]`,
        `${fieldName}_in: [[${singleType}]]`,
        `${fieldName}_nin: [[${singleType}]]`,
        `${fieldName}_contains: ${singleType}`,
        `${fieldName}_containsAny: [${singleType}]`,
        `${fieldName}_containsAll: [${singleType}]`,
        `${fieldName}_ne: [${singleType}]`
      );
      break;
    case StringArrayType:
      result.push(`${fieldName}_count: Int`);
      result.push(
        ...[`${fieldName}_textContains: String`, `${fieldName}_startsWith: String`, `${fieldName}_endsWith: String`, `${fieldName}_regex: String`]
      );
    case MongoIdArrayType:
      result.push(
        ...[
          `${fieldName}: [String]`,
          `${fieldName}_in: [[String]]`,
          `${fieldName}_nin: [[String]]`,
          `${fieldName}_contains: String`,
          `${fieldName}_containsAny: [String]`,
          `${fieldName}_containsAll: [String]`,
          `${fieldName}_ne: [String]`
        ]
      );
      break;
  }

  switch (realFieldType) {
    case MongoIdType:
    case StringType:
    case IntType:
    case FloatType:
    case DateType:
    case BoolType:
      result.push(`${fieldName}: ${fieldType}`);
      result.push(`${fieldName}_ne: ${fieldType}`);
      result.push(`${fieldName}_in: [${fieldType}]`);
      result.push(`${fieldName}_nin: [${fieldType}]`);
      break;
    case JSONType:
      result.push(`${fieldName}: ${fieldType}`);
      result.push(`${fieldName}_ne: ${fieldType}`);
      result.push(`${fieldName}_in: [${fieldType}]`);
      result.push(`${fieldName}_nin: [${fieldType}]`);
  }

  if (realFieldType.__isArray) {
    result.push(`${fieldName}_count: Int`);
  }
  if (realFieldType.__isObject || realFieldType.__isArray) {
    result.push(`${fieldName}: ${realFieldType.type.__name}Filters`);
  }

  return result;
}
