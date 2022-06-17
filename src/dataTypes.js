import { ObjectId } from "mongodb";

import * as dataTypeConstants from "./dataTypeConstants";

export const fieldOf = type => {
  return {
    customField: true,
    type,
    traits: new Set([]),
    nonQueryable() {
      return this.addTrait("non-queryable");
    },
    addTrait(trait) {
      const clone = { ...this };
      clone.traits = new Set(this.traits);
      clone.traits.add(trait);
      return clone;
    }
  };
};

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

export const MongoIdType = fieldOf(dataTypeConstants.MongoIdType);
export const MongoIdArrayType = fieldOf(dataTypeConstants.MongoIdArrayType);
export const StringType = fieldOf(dataTypeConstants.StringType);
export const StringArrayType = fieldOf(dataTypeConstants.StringArrayType);
export const IntType = fieldOf(dataTypeConstants.IntType);
export const IntArrayType = fieldOf(dataTypeConstants.IntArrayType);
export const FloatType = fieldOf(dataTypeConstants.FloatType);
export const FloatArrayType = fieldOf(dataTypeConstants.FloatArrayType);
export const DateType = fieldOf(dataTypeConstants.DateType);
export const BoolType = fieldOf(dataTypeConstants.BoolType);
export const JSONType = fieldOf(dataTypeConstants.JSONType);
