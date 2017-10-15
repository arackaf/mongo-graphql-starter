import { dataTypes } from "mongo-graphql-starter";
const { MongoId, String, Int, Float, Date, ArrayOf, typeLiteral } = dataTypes;

const Author = {
  table: "authors",
  fields: {
    _id: MongoId,
    name: String
  }
};

const Book = {
  table: "books",
  fields: {
    _id: MongoId,
    title: String,
    pages: Int,
    weight: Float,
    authors: ArrayOf(Author),
    strArrs: typeLiteral("[[String]]"),
    createdOn: Date
  }
};

export default {
  Author,
  Book
};
