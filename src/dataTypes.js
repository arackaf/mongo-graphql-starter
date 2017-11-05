import { ObjectId } from "mongodb";

export const MongoIdType = "MongoId";
export const StringType = "String";
export const StringArrayType = "StringArray";
export const IntType = "Int";
export const IntArrayType = "IntArray";
export const FloatType = "Float";
export const FloatArrayType = "FloatArray";
export const DateType = "Date";
export const arrayOf = type => {
  type.__usedInArray = true;
  return {
    __isArray: true,
    type
  };
};
export const objectOf = type => {
  return {
    __isObject: true,
    type
  };
};
export const typeLiteral = type => {
  return {
    __isLiteral: true,
    type
  };
};

export const formattedDate = options => {
  return {
    ...options,
    __isDate: true
  };
};

export const relationshipHelpers = {
  projectIds: (source, field, { type, fkField }) => {
    if (!source.relationships) {
      source.relationships = {};
    }

    let result = {
      type,
      fkField,
      __isArray: true
    };

    if (fkField) {
      let sourceField = source.fields[fkField];

      if (sourceField === StringArrayType) {
        result.identifySingle = owner => ({ _id: { $in: owner[fkField].map(owner => ObjectId(owner[fkField])) } });
        result.identifyMultiple = owners => ({ _id: { $in: flatMap(owners.map(owner => owner[fkField]), ids => ids.map(id => ObjectId(id))) } });
      } else if (0 && sourceField) {
        result.identifySingle = owners => ({ _id: { $in: owners.map(owner => owner[fkField]) } });
        result.identifyMultiple = owners => ({ _id: { $in: owners.map(owner => owner[fkField]) } });
      } else {
        throw "Invalid type for foreign key " + fkField + " which is a " + +" for type " + type;
      }
    }

    source.relationships[field] = result;
  }
};
