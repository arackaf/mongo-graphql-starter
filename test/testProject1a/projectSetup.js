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
    _id: MongoIdType.nonNull(),
    title: StringType.nonNull(),
    pages: IntType.nonNull(),
    weight: FloatType.nonNull(),
    keywords: StringArrayType.nonNull().containsNonNull(),
    editions: IntArrayType.nonNull().containsNonNull(),
    prices: FloatArrayType.nonNull().containsNonNull(),
    isRead: BoolType.nonNull(),
    mongoId: MongoIdType.nonNull(),
    mongoIds: MongoIdArrayType.nonNull().containsNonNull(),
    authors: arrayOf(Author).nonNull().containsNonNull(),
    primaryAuthor: objectOf(Author).nonNull(),
    strArrs: typeLiteral("[[String]]"),
    createdOn: DateType.nonNull(),
    createdOnYearOnly: formattedDate({ format: "%Y" }).nonNull(),
    jsonContent: JSONType.nonNull(),
    literalNonNullString: typeLiteral("String!")
  }
};

export const Subject = {
  table: "subjects",
  fields: {
    _id: MongoIdType.nonNull(),
    name: StringType.nonNull()
  }
};

export const Tag = {
  table: "tags",
  fields: {
    _id: StringType.nonNull(),
    name: StringType.nonNull(),
    count: IntType.nonNull()
  }
};

export const ReadonlyTag = {
  table: "tagsReadonly",
  readonly: true,
  fields: {
    name: StringType.nonNull(),
    count: IntType.nonNull()
  }
};
