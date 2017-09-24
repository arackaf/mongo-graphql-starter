import { MongoId, String, Int, Float } from "../../src/createGraphQlSchema.js";

// let MongoId = "",
//   String = "",
//   Int = "",
//   Float = "";

export const Person = {
  _id: MongoId,
  name: String,
  age: Int,
  weight: Float
};
