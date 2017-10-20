import { dataTypes } from "mongo-graphql-starter";
const { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf, objectOf, formattedDate, typeLiteral } = dataTypes;

const Author = {
  fields: {
    name: StringType,
    birthday: DateType
  }
};

const Book = {
  table: "books",
  fields: {
    _id: MongoIdType,
    title: StringType,
    pages: IntType,
    weight: FloatType,
    authors: arrayOf(Author),
    primaryAuthor: objectOf(Author),
    strArrs: typeLiteral("[[String]]"),
    createdOn: DateType,
    createdOnYearOnly: formattedDate({ format: "%Y" })
  }
};

const Subject = {
  table: "subjects",
  fields: {
    _id: MongoIdType,
    name: StringType
  }
};

export default {
  Book,
  Subject,
  Author
};
