import { MongoId, String, Int, Float } from "../../src/createGraphQlSchema/schemaTypes";

export const Person = {
  _id: MongoId,
  name: String,
  age: Int,
  weight: Float
};
