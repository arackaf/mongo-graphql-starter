import {
  MongoIdType,
  MongoIdArrayType,
  StringType,
  StringArrayType,
  BoolType,
  IntType,
  IntArrayType,
  FloatType,
  FloatArrayType,
  DateType,
  arrayOf,
  objectOf,
  formattedDate,
  JSONType,
  typeLiteral,
  fieldOf
} from "../../src/dataTypes";

export const Author = {
  fields: {
    name: fieldOf(StringType),
    birthday: fieldOf(DateType),
    strings: fieldOf(StringArrayType)
  }
};

export const Book = {
  table: "books",
  fields: {
    _id: fieldOf(MongoIdType),
    title: fieldOf(StringType),
    pages: fieldOf(IntType),
    weight: fieldOf(FloatType),
    keywords: fieldOf(StringArrayType),
    editions: fieldOf(IntArrayType),
    prices: fieldOf(FloatArrayType),
    isRead: fieldOf(BoolType),
    mongoId: fieldOf(MongoIdType),
    mongoIds: fieldOf(MongoIdArrayType),
    authors: fieldOf(arrayOf(Author)),
    primaryAuthor: fieldOf(objectOf(Author)),
    strArrs: fieldOf(typeLiteral("[[String]]")),
    createdOn: fieldOf(DateType),
    createdOnYearOnly: fieldOf(formattedDate({ format: "%Y" })),
    jsonContent: fieldOf(JSONType),

    nq__id: fieldOf(MongoIdType).nonQueryable(),
    nq_str: fieldOf(StringType).nonQueryable(),
    nq_strArr: fieldOf(StringArrayType).nonQueryable(),
    nq_bool: fieldOf(BoolType).nonQueryable(),
    nq_int: fieldOf(IntType).nonQueryable(),
    nq_intArr: fieldOf(IntArrayType).nonQueryable(),
    nq_float: fieldOf(FloatType).nonQueryable(),
    nq_floatArr: fieldOf(FloatArrayType).nonQueryable(),
    nq_date: fieldOf(DateType).nonQueryable(),
    nq_json: fieldOf(JSONType).nonQueryable()
  }
};

export const Subject = {
  table: "subjects",
  fields: {
    _id: fieldOf(MongoIdType),
    name: fieldOf(StringType)
  }
};

export const Tag = {
  table: "tags",
  fields: {
    _id: fieldOf(StringType),
    name: fieldOf(StringType),
    count: fieldOf(IntType)
  }
};

export const ReadonlyTag = {
  table: "tagsReadonly",
  readonly: true,
  fields: {
    name: fieldOf(StringType),
    count: fieldOf(IntType)
  }
};
