import {
  arrayOf,
  BoolType,
  DateType,
  FloatArrayType,
  FloatType,
  formattedDate,
  JSONType,
  MongoIdArrayType,
  MongoIdType,
  objectOf,
  StringArrayType,
  StringType
} from "../../src/dataTypes";
import { createMGSOutput } from "../../src/mongooseHelpers";
import { BookModel } from "./models";

export const AuthorExpected = {
  fields: {
    name: StringType,
    birthday: DateType,
    strings: StringArrayType
  }
};

export const BookExpected = {
  table: "books",
  fields: {
    title: StringType,
    // pages: IntType,
    pages: FloatType,
    weight: FloatType,
    keywords: StringArrayType,
    // editions: IntArrayType,
    editions: FloatArrayType,
    prices: FloatArrayType,
    isRead: BoolType,
    mongoId: MongoIdType,
    mongoIds: MongoIdArrayType,
    authors: arrayOf(AuthorExpected),
    // primaryAuthor: objectOf({ ...AuthorExpected }),
    // strArrs: typeLiteral("[[String]]"),
    createdOn: DateType,
    // createdOnYearOnly: formattedDate({ format: "%Y" }),
    jsonContent: JSONType,
    _id: MongoIdType
  }
};

test("Convert Mongoose Model 1", () => {
  const result = createMGSOutput(BookModel);
  console.log("EXPECTED", BookExpected.fields.authors.toString());
  expect(result.table).toEqual(BookExpected.table);
  expect(result).toMatchObject(BookExpected);
  // expect(result.fields).toMatchInlineSnapshot(`
  //   Object {
  //     "_id": "MongoId",
  //     "authors": Object {
  //       "__isArray": true,
  //       "toString": [Function],
  //       "type": Object {
  //         "__usedInArray": true,
  //         "fields": Object {
  //           "birthday": "Date",
  //           "name": "String",
  //           "strings": "StringArray",
  //         },
  //       },
  //     },
  //     "createdOn": "Date",
  //     "editions": "FloatArray",
  //     "isRead": "Boolean",
  //     "jsonContent": "JSON",
  //     "keywords": "StringArray",
  //     "mongoId": "MongoId",
  //     "mongoIds": "MongoIdArray",
  //     "pages": "Float",
  //     "prices": "FloatArray",
  //     "primaryAuthor": Object {
  //       "__isObject": true,
  //       "toString": [Function],
  //       "type": Object {
  //         "fields": Object {
  //           "birthday": "Date",
  //           "name": "String",
  //           "strings": "StringArray",
  //         },
  //       },
  //     },
  //     "title": "String",
  //     "weight": "Float",
  //   }
  // `);
});
