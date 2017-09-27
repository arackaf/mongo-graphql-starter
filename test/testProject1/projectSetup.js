const { dataTypes: { MongoId, String, Int, Float, ArrayOf } } = require("../../index");

const Author = {
  _id: MongoId,
  name: String
};

const Book = {
  _id: MongoId,
  title: String,
  pages: Int,
  weight: Float,
  authors: ArrayOf(Author)
};

module.exports = {
  Author,
  Book
};
