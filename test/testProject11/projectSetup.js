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
  typeLiteral
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

export const SubType = {
  fields: {
    id: StringType
  }
};

export const Thing1 = {
  table: "thing1",
  fields: {
    nonNullString: StringType.nonNull(),
    nonNullStringArray: StringArrayType.nonNull(),
    nonNullStringArrayOfNonNull: StringArrayType.nonQueryable().nonNull().containsNonNull(),

    nonNullMongoId: MongoIdType.nonNull(),
    nonNullMongoIdArray: MongoIdArrayType.nonNull(),
    nonNullMongoIdArrayOfNonNull: MongoIdArrayType.nonNull().containsNonNull(),

    nonNullInt: IntType.nonNull(),
    nonNullIntArray: IntArrayType.nonNull(),
    nonNullIntArrayOfNonNull: IntArrayType.nonNull().containsNonNull(),

    nonNullFloat: FloatType.nonNull(),
    nonNullFloatArray: FloatArrayType.nonNull(),
    nonNullFloatArrayOfNonNull: FloatArrayType.nonNull().containsNonNull(),

    nonNullDate: DateType.nonNull(),

    nonNullObject: objectOf(SubType).nonNull(),
    nonNullArrayOfObjects: arrayOf(SubType).nonNull(),
    nonNullArrayOfNonNullObjects: arrayOf(SubType).nonNull().containsNonNull()
  }
};
