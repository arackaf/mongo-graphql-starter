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

export const Book = {
  table: "books",
  readonly: true,
  fields: {
    _id: MongoIdType,
    title: StringType,
    isRead: BoolType,
  }
};
