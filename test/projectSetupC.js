import { dataTypes } from "mongo-graphql-starter";
const { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf, objectOf, formattedDate, typeLiteral } = dataTypes;

const Tag = {
  table: "tags",
  fields: {
    _id: MongoIdType,
    tagName: StringType
  }
};

const Author = {
  table: "authors",
  fields: {
    name: StringType,
    tags: arrayOf(Tag)
  }
};

Tag.fields.authors = arrayOf(Author);

export default {
  Author,
  Tag
};
