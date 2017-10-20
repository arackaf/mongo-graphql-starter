import Author from "../Author/Author";

export default {
  table: "books",
  fields: {
    _id: "MongoId",
    title: "String",
    pages: "Int",
    weight: "Float",
    authors: {
      __isArray: true,
      type: Author
    },
    primaryAuthor: {
      __isObject: true,
      type: Author
    },
    strArrs: "[[String]]",
    createdOn: {
      __isDate: true,
      format: "%m/%d/%Y"
    },
    createdOnYearOnly: {
      __isDate: true,
      format: "%Y"
    }
  }  
};