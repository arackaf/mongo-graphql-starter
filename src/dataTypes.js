import { ObjectId } from "mongodb";

const makeType = (props = {}) => {
  return {
    ...props
  };
};

export const MongoIdType = { type: "String" };
export const MongoIdArrayType = { __mongoIdArray: true, type: "[String]", scalarArray: true, underlyingType: "String" };
export const StringType = { type: "String" };
export const StringArrayType = { type: "[String]", scalarArray: true, underlyingType: "String" };
export const IntType = { type: "Int" };
export const IntArrayType = { type: "[Int]", scalarArray: true, underlyingType: "Int" };
export const FloatType = { type: "Float" };
export const FloatArrayType = { type: "[Float]", scalarArray: true, underlyingType: "Float" };
export const DateType = { __isDate: true, type: "String" };
export const BoolType = { type: "Boolean" };
export const JSONType = { type: "JSON" };

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
    type: "String",
    __isDate: true
  };
};
