export const MongoId = "MongoId";
export const String = "String";
export const Int = "Int";
export const Float = "Float";
export const Date = "Date";
export const arrayOf = type => {
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
