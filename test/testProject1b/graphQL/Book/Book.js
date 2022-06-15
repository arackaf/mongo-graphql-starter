import Author from "../Author/Author";

export default {
  table: "books",
  typeName: "Book",
  fields: {
    _id: "MongoId",
    title: "String",
    pages: "Int",
    weight: "Float",
    keywords: "StringArray",
    editions: "IntArray",
    prices: "FloatArray",
    isRead: "Boolean",
    mongoId: "MongoId",
    mongoIds: "MongoIdArray",
    authors: {
      __isArray: true,
      get type() {
        return Author;
      }
    },
    primaryAuthor: {
      __isObject: true,
      get type() {
        return Author;
      }
    },
    strArrs: "[[String]]",
    createdOn: {
      __isDate: true,
      format: "%m/%d/%Y"
    },
    createdOnYearOnly: {
      __isDate: true,
      format: "%Y"
    },
    jsonContent: "JSON",
    nq__id: "MongoId",
    nq_str: "String",
    nq_strArr: "StringArray",
    nq_bool: "Boolean",
    nq_int: "Int",
    nq_intArr: "IntArray",
    nq_float: "Float",
    nq_floatArr: "FloatArray",
    nq_date: {
      __isDate: true,
      format: "%m/%d/%Y"
    },
    nq_json: "JSON"
  },
  relationships: {}
};
