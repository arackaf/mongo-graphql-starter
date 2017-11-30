import { dataTypes } from "mongo-graphql-starter";
const { StringType, StringArrayType, IntType } = dataTypes;

const fields = {
  field1: StringType,
  field2: StringType,
  poisonField: IntType,
  autoUpdateField: StringType,
  userId: IntType
};

const Type1 = {
  table: "type1",
  fields
};

const Type2 = {
  table: "type2",
  fields
};

const Type3 = {
  table: "type3",
  fields
};

const Type4 = {
  table: "type4",
  fields
};

export default {
  Type1,
  Type2,
  Type3,
  Type4
};
