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

export const Book = {
  table: "books",
  fields: {
    _id: MongoIdType.nonQueryable(),
    str: StringType.nonQueryable(),
    strArr: StringArrayType.nonQueryable(),
    bool: BoolType.nonQueryable(),
    int: IntType.nonQueryable(),
    intArr: IntArrayType.nonQueryable(),
    float: FloatType.nonQueryable(),
    floatArr: FloatArrayType.nonQueryable(),
    date: DateType.nonQueryable(),
    json: JSONType.nonQueryable(),

    queryable__id: MongoIdType,
    queryable_str: StringType,
    queryable_strArr: StringArrayType,
    queryable_bool: BoolType,
    queryable_int: IntType,
    queryable_intArr: IntArrayType,
    queryable_float: FloatType,
    queryable_floatArr: FloatArrayType,
    queryable_date: DateType,
    queryable_json: JSONType
  }
};
