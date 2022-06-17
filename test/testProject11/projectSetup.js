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
    nq_json: JSONType.nonQueryable(),

    nonNullString: StringType.nonNull(),
    nonNullStringArray: StringArrayType.nonNull(),
    nonNullStringArrayOfNonNull: StringArrayType.nonNull().containsNonNull()
  }
};
