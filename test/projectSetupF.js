import { dataTypes } from "mongo-graphql-starter";
import { MongoIdType } from "../src/dataTypes";
const { StringType, StringArrayType, IntType } = dataTypes;

const fields = {
  field1: StringType,
  field2: StringType,
  autoAdjustField: IntType,
  poisonField: IntType,
  autoUpdateField: IntType,
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

const UpdateInfo = {
  table: "updateInfo",
  fields: {
    updatedId: MongoIdType,
    x: IntType
  }
};

const InsertInfo = {
  table: "insertInfo",
  fields: {
    insertedId: MongoIdType,
    y: IntType
  }
};

const DeleteInfo = {
  table: "deleteInfo",
  fields: {
    deletedId: MongoIdType,
    x: IntType
  }
};

export default {
  Type1,
  Type2,
  UpdateInfo,
  InsertInfo,
  DeleteInfo
};
