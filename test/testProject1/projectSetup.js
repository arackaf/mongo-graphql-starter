const { dataTypes: { MongoId, String, Int, Float, ArrayOf } } = require("../../index");

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

module.exports = {
  Author,
  Book
};
