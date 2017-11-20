import { dataTypes } from "mongo-graphql-starter";
const {
  MongoIdType,
  MongoIdArrayType,
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
  relationshipHelpers
} = dataTypes;

const Keyword = {
  table: "keywords",
  fields: {
    keywordName: StringType
  }
};

const Subject = {
  table: "subjects",
  fields: {
    name: StringType,
    keywordIds: MongoIdArrayType
  }
};

relationshipHelpers.projectIds(Subject, "keywords", {
  type: Keyword,
  fkField: "keywordIds"
});

const Author = {
  table: "authors",
  fields: {
    name: StringType,
    birthday: DateType,
    subjectIds: MongoIdArrayType,
    firstBookId: StringType
  }
};

relationshipHelpers.projectIds(Author, "subjects", {
  type: Subject,
  fkField: "subjectIds"
});

const Book = {
  table: "books",
  fields: {
    _id: MongoIdType,
    title: StringType,
    pages: IntType,
    weight: FloatType,
    mainAuthorId: MongoIdType,
    authorIds: MongoIdArrayType,
    primaryAuthorId: StringType
  }
};

relationshipHelpers.projectIds(Book, "authors", {
  type: Author,
  fkField: "authorIds"
});

relationshipHelpers.projectId(Book, "mainAuthor", {
  type: Author,
  fkField: "mainAuthorId"
});

relationshipHelpers.projectId(Author, "firstBook", {
  type: Book,
  fkField: "firstBookId"
});

export default {
  Book,
  Author,
  Subject,
  Keyword
};
