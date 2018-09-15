import { MongoIdType, MongoIdArrayType, StringType, IntType, FloatType, DateType, arrayOf, objectOf } from "../../src/dataTypes";

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
  },
  relationships: {
    keywords: {
      type: Keyword,
      fkField: "keywordIds"
    }
  }
};

const Author = {
  table: "authors",
  fields: {
    name: StringType,
    birthday: DateType,
    mainSubjectId: MongoIdType,
    subjectIds: MongoIdArrayType,
    firstBookId: MongoIdType
  },
  relationships: {
    mainSubject: {
      type: Subject,
      fkField: "mainSubjectId"
    },
    subjects: {
      type: Subject,
      fkField: "subjectIds"
    },
    firstBook: {
      get type() {
        return Book;
      },
      fkField: "firstBookId"
    }
  }
};

const Book = {
  table: "books",
  fields: {
    _id: MongoIdType,
    title: StringType,
    pages: IntType,
    weight: FloatType,
    mainAuthorId: MongoIdType,
    cachedMainAuthor: objectOf(Author),
    authorIds: MongoIdArrayType,
    cachedAuthors: arrayOf(Author)
  },
  relationships: {
    authors: {
      type: Author,
      fkField: "authorIds"
    },
    mainAuthor: {
      type: Author,
      fkField: "mainAuthorId"
    }
  }
};

export default {
  Book,
  Author,
  Subject,
  Keyword
};
