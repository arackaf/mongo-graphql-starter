export const MongoId = "MongoId";
export const String = "String";
export const Int = "Int";
export const Float = "Float";
export const ArrayOf = type => {
  return {
    isArray: true,
    type
  };
};
