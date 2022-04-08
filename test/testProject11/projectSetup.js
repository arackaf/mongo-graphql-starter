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
    _id: fieldOf(MongoIdType).nonQueryable(),
    str: fieldOf(StringType).nonQueryable(),
    strArr: fieldOf(StringArrayType).nonQueryable(),
    bool: fieldOf(BoolType).nonQueryable(),
    int: fieldOf(IntType).nonQueryable(),
    intArr: fieldOf(IntArrayType).nonQueryable(),
    float: fieldOf(FloatType).nonQueryable(),
    floatArr: fieldOf(FloatArrayType).nonQueryable(),
    date: fieldOf(DateType).nonQueryable(),
    json: fieldOf(JSONType).nonQueryable(),

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
