import { ObjectId } from "mongodb";

export const MongoIdType = "MongoId";
export const MongoIdArrayType = "MongoIdArray";
export const StringType = "String";
export const StringArrayType = "StringArray";
export const IntType = "Int";
export const IntArrayType = "IntArray";
export const FloatType = "Float";
export const FloatArrayType = "FloatArray";
export const DateType = "Date";
export const BoolType = "Boolean";
export const JSONType = "JSON";

export const arrayOf = type => {
  type.__usedInArray = true;
  return {
    __isArray: true,
    type,
    toString() {
      return "Array of " + (type.table || type.toString());
    }
  };
};
export const objectOf = type => {
  return {
    __isObject: true,
    type,
    toString() {
      return "Object of " + (type.table || type.toString());
    }
  };
};
export const typeLiteral = type => {
  return {
    __isLiteral: true,
    type,
    toString() {
      return type;
    }
  };
};

export const formattedDate = options => {
  return {
    ...options,
    __isDate: true
  };
};

export const relationshipHelpers = {
  projectIds: (source, field, { type, keyField, fkField }) => {
    if (!source.relationships) {
      source.relationships = {};
    }

    let result = {
      type,
      fkField,
      keyField,
      __isArray: true
    };

    if (fkField) {
      let sourceField = source.fields[fkField];

      if (!(sourceField === StringArrayType || sourceField === MongoIdArrayType)) {
        throw "Invalid type for foreign key " + fkField + " which is type " + sourceField + ". Use a StringArray or MongoIdArray instead";
      }
    }

    source.relationships[field] = result;
  },
  projectId: (source, field, { type, fkField, keyField }) => {
    if (!source.relationships) {
      source.relationships = {};
    }

    let result = {
      type,
      fkField,
      keyField,
      __isObject: true
    };

    if (fkField) {
      let sourceField = source.fields[fkField];

      if (!(sourceField === StringType || sourceField === MongoIdType)) {
        throw "Invalid type for foreign key " + fkField + " which is type " + sourceField + ". Use a String or MongoId instead";
      }
    }

    source.relationships[field] = result;
  }
};
