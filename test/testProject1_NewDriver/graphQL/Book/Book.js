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
    mongoIds: "MongoIdArray",
    authors: {
      __isArray: true,
      get type(){ return Author; }
    },
    primaryAuthor: {
      __isObject: true,
      get type(){ return Author; }
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
    jsonContent: "JSON"
  }
};