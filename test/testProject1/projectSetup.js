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
  typeLiteral
} from "../../src/dataTypes";

export const Author = {
  fields: {
    name: StringType,
    birthday: DateType,
    strings: StringArrayType
  }
};

export const Book = {
  table: "books",
  fields: {
    _id: MongoIdType,
    title: StringType,
    pages: IntType,
    weight: FloatType,
    keywords: StringArrayType,
    editions: IntArrayType,
    prices: FloatArrayType,
    isRead: BoolType,
    mongoId: MongoIdType,
    mongoIds: MongoIdArrayType,
    authors: arrayOf(Author),
    primaryAuthor: objectOf(Author),
    strArrs: typeLiteral("[[String]]"),
    createdOn: DateType,
    createdOnYearOnly: formattedDate({ format: "%Y" }),
    jsonContent: JSONType
  }
};

export const Subject = {
  table: "subjects",
  fields: {
    _id: MongoIdType,
    name: StringType
  }
};

export const Tag = {
  table: "tags",
  fields: {
    _id: StringType,
    name: StringType,
    count: IntType
  }
};

export const ReadonlyTag = {
  table: "tagsReadonly",
  readonly: true,
  fields: {
    name: StringType,
    count: IntType
  }
};
