import createGraphqlSchema from "../../src/createGraphqlSchema";
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
import path from "path";
import fs from "fs";

beforeEach(() => {
  fs.rmdirSync(path.resolve("./test/testProject11/graphQL"), { recursive: true });
});

test("Convert Mongoose Model 1", async () => {
  // const result = createMGSOutput(BookModel);
  // const result = convertSchemas({
  //   // Book: BookSchema,
  //   Author: AuthorSchema
  // });
  const mongooseProjectSetup = {
    Author: AuthorSchema,
    Book: BookSchema
  };
  // console.log("EXPECTED", BookExpected.fields.authors.toString());
  // console.log(JSON.stringify(BookSchema, null, 3));
  // console.log(JSON.stringify(AuthorSchema, null, 3));
  // console.log(JSON.stringify(result));
  await createGraphqlSchema(mongooseProjectSetup, path.resolve("./test/testProject11"), { mongoose: true });
  // await createGraphqlSchema(projectSetup, path.resolve("./test/testProject11"));
  // expect(result.table).toEqual(BookExpected.table);
  // expect(JSON.stringify(result)).toEqual(JSON.stringify(projectSetup.Book));
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
