export const MongoIdType = "MongoId";
export const StringType = "String";
export const StringArrayType = "StringArray";
export const IntType = "Int";
export const IntArrayType = "IntArray";
export const FloatType = "Float";
export const DateType = "Date";
export const arrayOf = type => {
  type.__usedInArray = true;
  return {
    __isArray: true,
    type
  };
};
export const objectOf = type => {
  return {
    __isObject: true,
    type
  };
};
export const typeLiteral = type => {
  return {
    __isLiteral: true,
    type
  };
};

export const formattedDate = options => {
  return {
    ...options,
    __isDate: true
  };
};
