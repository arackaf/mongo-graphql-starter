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
  typeLiteral,
  fieldOf
} from "../../src/dataTypes";

export const Thing1 = {
  table: "thing1",
  fields: {
    q__id: MongoIdType,
    q__id_arr: MongoIdArrayType,
    q_str: StringType,
    q_strArr: StringArrayType,
    q_bool: BoolType,
    q_int: IntType,
    q_intArr: IntArrayType,
    q_float: FloatType,
    q_floatArr: FloatArrayType,
    q_date: DateType,
    q_json: JSONType,

    nq__id: MongoIdType.nonQueryable(),
    nq__id_arr: MongoIdArrayType.nonQueryable(),
    nq_str: StringType.nonQueryable(),
    nq_strArr: StringArrayType.nonQueryable(),
    nq_bool: BoolType.nonQueryable(),
    nq_int: IntType.nonQueryable(),
    nq_intArr: IntArrayType.nonQueryable(),
    nq_float: FloatType.nonQueryable(),
    nq_floatArr: FloatArrayType.nonQueryable(),
    nq_date: DateType.nonQueryable(),
    nq_json: JSONType.nonQueryable()
  }
};