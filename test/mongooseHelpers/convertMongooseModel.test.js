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
import { convertSchemas, createMGSOutput } from "../../src/mongooseHelpers";
import { BookModel, BookSchema, AuthorSchema } from "./models";
import * as projectSetup from "./projectSetup";

test("Convert Mongoose Model 1", () => {
  const result = createMGSOutput(BookModel);
  // const result = convertSchemas({
  //   // Book: BookSchema,
  //   Author: AuthorSchema
  // });
  // console.log("EXPECTED", BookExpected.fields.authors.toString());
  // console.log(JSON.stringify(BookSchema, null, 3));
  // console.log(JSON.stringify(AuthorSchema, null, 3));
  console.log(JSON.stringify(result));
  console.log(JSON.stringify(projectSetup, null, 3));
  // expect(result.table).toEqual(BookExpected.table);
  expect(JSON.stringify(result)).toEqual(JSON.stringify(projectSetup.Book));
  // expect(result).toMatchObject(BookExpected);
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
