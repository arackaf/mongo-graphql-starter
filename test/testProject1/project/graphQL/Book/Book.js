import Author from "../Author/Author";

export const Test = {
  fields: [
    {
      _id: "MongoId",
      title: "String",
      pages: "Int",
      weight: "Float",
      authors: { __isArray: true, type: Author }
    }
  ]
};