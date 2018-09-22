import { MongoIdType, StringType, StringArrayType, IntType, FloatType, DateType, arrayOf, objectOf } from "../../src/dataTypes";

export const Keyword = {
  table: "keywords",
  fields: {
    keywordName: StringType
  }
};

export const Subject = {
  table: "subjects",
  fields: {
    name: StringType,
    keywordIds: StringArrayType
  },
  relationships: {
    keywords: {
      type: Keyword,
      fkField: "keywordIds"
    }
  }
};

export const Author = {
  table: "authors",
  fields: {
    name: StringType,
    birthday: DateType,
    mainSubjectId: StringType,
    subjectIds: StringArrayType,
    firstBookId: StringType
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

export const Book = {
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
