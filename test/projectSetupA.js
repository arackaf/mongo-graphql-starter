import { dataTypes } from "mongo-graphql-starter";
const { MongoId, String, Int, Float, ArrayOf } = dataTypes;

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
    authors: ArrayOf(Author)
  }
};

export default {
  Author,
  Book
};
