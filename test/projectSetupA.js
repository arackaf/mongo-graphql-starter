import { dataTypes } from "mongo-graphql-starter";
const { MongoId, String, Int, Float, Date, ArrayOf, formattedDate, typeLiteral } = dataTypes;

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
    createdOn: Date,
    createdOnYearOnly: formattedDate({ format: "%Y" })
  }
};

export default {
  Author,
  Book
};
