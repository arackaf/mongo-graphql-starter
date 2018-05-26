import { MongoIdType, StringType, StringArrayType, IntType, FloatType, DateType, arrayOf, objectOf, relationshipHelpers } from "../../src/dataTypes";

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
    keywordIds: StringArrayType
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
    mainSubjectId: StringType,
    subjectIds: StringArrayType,
    firstBookId: StringType
  }
};

relationshipHelpers.projectId(Author, "mainSubject", {
  type: Subject,
  fkField: "mainSubjectId"
});

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
    mainAuthorId: StringType,
    cachedMainAuthor: objectOf(Author),
    authorIds: StringArrayType,
    cachedAuthors: arrayOf(Author)
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
