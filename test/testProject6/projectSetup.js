import { StringType, StringArrayType, IntType, MongoIdType } from "../../src/dataTypes";

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

const Coordinate = {
  table: "coordinates",
  fields: {
    x: IntType,
    y: IntType
  },
  resolvedFields: {
    pointAbove: "Coordinate",
    allNeighbors: "[Coordinate]"
  },
  extras: {
    resolverSources: ["../../graphQL-extras/coordinateResolverExtras"],
    schemaSources: ["../../graphQL-extras/coordinateSchemaExtras"],
    overrides: ["getCoordinate", "updateCoordinate"]
  }
};

export default {
  Type1,
  Type2,
  UpdateInfo,
  InsertInfo,
  DeleteInfo,
  Coordinate
};
