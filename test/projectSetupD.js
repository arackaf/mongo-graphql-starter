import { dataTypes } from "mongo-graphql-starter";
const {
  MongoIdType,
  StringType,
  StringArrayType,
  IntType,
  IntArrayType,
  FloatType,
  FloatArrayType,
  DateType,
  arrayOf,
  objectOf,
  formattedDate,
  typeLiteral,
  multiRelationship
} = dataTypes;

const Author = {
  table: "authors",
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
    authorIds: StringArrayType,
    primaryAuthorId: StringType
  },
  relationships: {}
};

Book.relationships.authors = multiRelationship({
  source: Book,
  type: Author,
  fkField: "authorIds"
});

export default {
  Book,
  Author
};
