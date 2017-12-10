import { dataTypes } from "mongo-graphql-starter";
import { MongoIdType, IntArrayType, FloatArrayType } from "../src/dataTypes";
const { StringType, StringArrayType, IntType } = dataTypes;

const Thing = {
  table: "things",
  fields: {
    name: StringType,
    strs: StringArrayType,
    ints: IntArrayType,
    floats: FloatArrayType
  },
  manualQueryArgs: [{ name: "ManualArg", type: "String" }]
};

export default {
  Thing
};
