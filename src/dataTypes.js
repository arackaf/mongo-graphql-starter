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
