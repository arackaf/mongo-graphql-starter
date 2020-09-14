import * as dataTypes from "./dataTypes";
import mongoose from "mongoose";
const {
  BoolType,
  DateType,
  StringArrayType,
  FloatArrayType,
  FloatType,
  JSONType,
  MongoIdArrayType,
  MongoIdType,
  StringType,
  arrayOf,
  formattedDate,
  objectOf,
  typeLiteral
} = dataTypes;

function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const ComplexTypes = {
  ARRAY: "ARRAY",
  EMBEDDED: "EMBEDDED",
  DOCUMENT_ARRAY: "DOCUMENT_ARRAY",
  ENUM: "ENUM",
  REFERENCE: "REFERENCE",
  SCALAR: "SCALAR",
  MIXED: "MIXED",
  DECIMAL: "DECIMAL"
};

function _getFieldName(field) {
  return field.path || "__unknownField__";
}

function _getFieldType(field) {
  return field.instance;
}

function _getFieldDescription(field) {
  if (field.options && field.options.description) {
    return field.options.description;
  }

  return undefined;
}

function _getFieldEnums(field) {
  if (field.enumValues && field.enumValues.length > 0) {
    return field.enumValues;
  }

  return undefined;
}

export function dotPathsToEmbedded(fields) {
  const result = {};

  Object.keys(fields).forEach(fieldName => {
    const dotIdx = fieldName.indexOf(".");
    if (dotIdx === -1) {
      result[fieldName] = fields[fieldName];
    } else if (fieldName.substr(dotIdx, 3) === ".$*") {
      // skip { type: Map of: String }
      // do not add this field to result
    } else {
      // create pseudo sub-model
      const name = fieldName.substr(0, dotIdx);
      if (!result[name]) {
        const embeddedField = {
          instance: "Embedded",
          path: name,
          schema: {
            paths: {}
          }
        };
        result[name] = embeddedField;
      }
      const subName = fieldName.substr(dotIdx + 1);

      const fieldSchema = result[name].schema;
      if (!fieldSchema) {
        throw new Error(`Field ${name} does not have schema property`);
      }
      fieldSchema.paths[subName] = { ...fields[fieldName], path: subName };
    }
  });

  return result;
}

export const getComplexType = field => {
  if (!field || !field.path || !field.instance) {
    throw new Error(
      "You provide incorrect mongoose field to `getComplexType()`. " + "Correct field should contain `path` and `instance` properties."
    );
  }

  const fieldType = _getFieldType(field);
  if (field instanceof mongoose.Schema.Types.DocumentArray || (fieldType === "Array" && field && field.schema && field.schema.paths)) {
    return ComplexTypes.DOCUMENT_ARRAY;
  } else if (field instanceof mongoose.Schema.Types.Embedded || fieldType === "Embedded") {
    return ComplexTypes.EMBEDDED;
  } else if (field instanceof mongoose.Schema.Types.Array || (field && field.caster && field.caster.instance)) {
    return ComplexTypes.ARRAY;
  } else if (field instanceof mongoose.Schema.Types.Mixed) {
    return ComplexTypes.MIXED;
  } else if (fieldType === "ObjectID") {
    return ComplexTypes.REFERENCE;
  } else if (fieldType === "Decimal128") {
    return ComplexTypes.DECIMAL;
  }

  const enums = _getFieldEnums(field);
  if (enums) {
    return ComplexTypes.ENUM;
  }

  return ComplexTypes.SCALAR;
};

export function convertFieldToMSGType(field, prefix = "") {
  const complexType = getComplexType(field);
  // console.log("complexType", complexType);
  switch (complexType) {
    case ComplexTypes.SCALAR:
      return scalarToMGSType(field);
    case ComplexTypes.ARRAY:
      return arrayToMGSType(field, prefix);
    case ComplexTypes.EMBEDDED:
      return embeddedToMGSType(field, prefix);
    // case ComplexTypes.ENUM:
    //   return enumToMGSType(field, prefix);
    // case ComplexTypes.REFERENCE:
    //   return referenceToMGSType(field, prefix);
    case ComplexTypes.DOCUMENT_ARRAY:
      return docArrayToMGSType(field, prefix);
    case ComplexTypes.MIXED:
      return JSONType;
    // case ComplexTypes.DECIMAL:
    //   return arrayToMGSType(field, prefix);
    default:
      return scalarToMGSType(field);
  }
}

export const getFieldsFromModel = model => {
  if (!model || !model.schema || !model.schema.paths) {
    throw new Error("You provide incorrect mongoose model to `convertMongooseModel()`. " + "Correct model should contain `schema.paths` properties.");
  }
  const { schema } = model;
  // console.log(schema);

  const paths = dotPathsToEmbedded(schema.paths);
  const fields = {};

  Object.keys(paths)
    .filter(path => !path.startsWith("__")) // skip hidden fields
    .forEach(path => {
      fields[path] = paths[path];
    });

  return fields;
};

export const convertMongooseModel = (model, prefix = "") => {
  const mongooseFields = getFieldsFromModel(model);
  const formattedFields = Object.keys(mongooseFields).reduce((acc, pathName, i) => {
    return {
      ...acc,
      [pathName]: convertFieldToMSGType(mongooseFields[pathName])
    };
  }, {});
  if (prefix === "") {
    return formattedFields;
  } else {
    return { [prefix.toLowerCase()]: formattedFields };
  }
};

export const createMGSOutput = model => {
  if (!model || !model.modelName) {
    throw new Error("You provide incorrect mongoose model to `createMGSOutput()`. " + "Correct model should contain `modelName` property.");
  }

  const fields = convertMongooseModel(model, "");

  return {
    table: model.modelName.toLowerCase() + "s",
    fields
  };
};

export function scalarToMGSType(field) {
  const typeName = _getFieldType(field);

  switch (typeName) {
    case "String":
      return StringType;
    case "Number":
      return FloatType;
    case "Date":
      return DateType;
    // case 'Buffer':
    //   return 'Buffer';
    case "Boolean":
      return BoolType;
    case "ObjectID":
      return MongoIdType;
    default:
      return JSONType;
  }
}

export function arrayToMGSType(field, prefix = "") {
  if (!field || !field.caster) {
    throw new Error("You provide incorrect mongoose field to `arrayToMGSType()`. " + "Correct field should contain `caster` property.");
  }

  const unwrappedField = { ...field.caster };

  const outputType = convertFieldToMSGType(unwrappedField, prefix);

  switch (outputType) {
    case "String":
      return StringArrayType;
    case "Number":
    case "Float":
      return FloatArrayType;
    // case "Date":
    //   return DateType;
    // case 'Buffer':
    //   return 'Buffer';
    // case "Boolean":
    //   return BoolType;
    case "MongoId":
    case "ObjectID":
      return MongoIdArrayType;
    default:
      return StringArrayType;
  }
}

export function embeddedToMGSType(field, prefix = "") {
  const fieldName = _getFieldName(field);
  const fieldType = _getFieldType(field);

  if (fieldType !== "Embedded") {
    throw new Error(`You provide incorrect field '${prefix}.${fieldName}' to 'embeddedToMGSType()'. ` + "This field should has `Embedded` type. ");
  }

  const fieldSchema = field.schema;
  if (!fieldSchema) {
    throw new Error(`Mongoose field '${prefix}.${fieldName}' should have 'schema' property`);
  }

  const mgsType = convertMongooseModel(field, "fields");

  return objectOf(mgsType);
}

// export function enumToGraphQL(
//   field: MongooseFieldT,
//   prefix: string = '',
//   schemaComposer: SchemaComposer<any>
// ): EnumTypeComposer<any> {
//   const valueList = _getFieldEnums(field);
//   if (!valueList) {
//     throw new Error(
//       'You provide incorrect mongoose field to `enumToGraphQL()`. ' +
//         'Correct field should contain `enumValues` property'
//     );
//   }

//   const typeName = `Enum${prefix}${upperFirst(_getFieldName(field))}`;

//   return schemaComposer.getOrCreateETC(typeName, (etc) => {
//     const desc = _getFieldDescription(field);
//     if (desc) etc.setDescription(desc);

//     const fields = valueList.reduce((result, value) => {
//       const key = value.replace(/[^_a-zA-Z0-9]/g, '_');
//       result[key] = { value }; // eslint-disable-line no-param-reassign
//       return result;
//     }, {} as Record<string, { value: any }>);
//     etc.setFields(fields);
//   });
// }

export function docArrayToMGSType(field, prefix = "") {
  if ((!(field instanceof mongoose.Schema.Types.DocumentArray) && !field) || !field.schema || !field.schema.paths) {
    throw new Error(
      "You provide incorrect mongoose field to `docArrayToMGSType()`. " + "Correct field should be instance of `mongoose.Schema.Types.DocumentArray`"
    );
  }
  const typeName = `${prefix}${upperFirst(_getFieldName(field))}`;
  const mgsType = convertMongooseModel(field, "fields");

  return arrayOf(mgsType);
}

export function referenceToMGSType(field) {
  return scalarToMGSType(field);
}
