import { ObjectId } from "mongodb";

import * as dataTypeConstants from "./dataTypeConstants";

const objectFieldPrototype = {
  customField: true,
  traits: new Set([]),

  nonQueryable() {
    return this.addTrait("non-queryable");
  },
  nonNull() {
    return this.addTrait("non-null");
  },
  limitQueriesTo(queries) {
    this.queryWhitelist = queries;
    return this.addTrait("query-whitelist");
  },
  addTrait(trait) {
    const proto = Object.getPrototypeOf(this);

    const clone = Object.assign(Object.create(proto), this);
    clone.traits = new Set(this.traits);
    clone.traits.add(trait);
    return clone;
  }
};

const arrayFieldPrototype = Object.assign({}, objectFieldPrototype, {
  containsNonNull() {
    return this.addTrait("contains-non-null");
  }
});

const objectFieldOf = type => {
  return Object.assign(Object.create(objectFieldPrototype), {
    type
  });
};

const arrayFieldOf = type => {
  return Object.assign(Object.create(arrayFieldPrototype), {
    type
  });
};

export const arrayOf = type => {
  type.__usedInArray = true;
  return arrayFieldOf({
    __isArray: true,
    type,
    toString() {
      return "Array of " + (type.table || type.toString());
    }
  });
};
export const objectOf = type => {
  return objectFieldOf({
    __isObject: true,
    type,
    toString() {
      return "Object of " + (type.table || type.toString());
    }
  });
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
  return objectFieldOf({
    ...options,
    __isDate: true
  });
};

export const MongoIdType = objectFieldOf(dataTypeConstants.MongoIdType);
export const MongoIdArrayType = arrayFieldOf(dataTypeConstants.MongoIdArrayType);
export const StringType = objectFieldOf(dataTypeConstants.StringType);
export const StringArrayType = arrayFieldOf(dataTypeConstants.StringArrayType);
export const IntType = objectFieldOf(dataTypeConstants.IntType);
export const IntArrayType = arrayFieldOf(dataTypeConstants.IntArrayType);
export const FloatType = objectFieldOf(dataTypeConstants.FloatType);
export const FloatArrayType = arrayFieldOf(dataTypeConstants.FloatArrayType);
export const DateType = objectFieldOf(dataTypeConstants.DateType);
export const BoolType = objectFieldOf(dataTypeConstants.BoolType);
export const JSONType = objectFieldOf(dataTypeConstants.JSONType);
