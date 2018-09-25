import { MongoIdType, MongoIdArrayType, StringType, StringArrayType, IntType, FloatType, DateType, arrayOf, objectOf } from "../../src/dataTypes";

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
    keywordIds: MongoIdArrayType,
    bookIds: MongoIdArrayType
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
    mainSubjectId: MongoIdType,
    subjectIds: MongoIdArrayType,
    junkId: MongoIdType,
    junkIds: MongoIdArrayType,
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
    },
    books: {
      get type() {
        return Book;
      },
      fkField: "_id",
      keyField: "authorIds"
    },
    mainAuthorBooks: {
      get type() {
        return Book;
      },
      fkField: "_id",
      keyField: "mainAuthorId"
    },
    mainAuthorNamesBooks: {
      get type() {
        return Book;
      },
      fkField: "name",
      keyField: "mainAuthorName"
    },
    authorNamesBooks: {
      get type() {
        return Book;
      },
      fkField: "name",
      keyField: "authorNames"
    },
    junkAuthorBooks: {
      get type() {
        return Book;
      },
      fkField: "junkId",
      keyField: "authorJunkId"
    },
    junkAuthorBooksMany: {
      get type() {
        return Book;
      },
      fkField: "junkId",
      keyField: "authorJunkIds"
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
    mainAuthorId: MongoIdType,
    mainAuthorName: StringType,
    cachedMainAuthor: objectOf(Author),
    authorIds: MongoIdArrayType,
    authorJunkId: MongoIdType,
    authorJunkIds: MongoIdArrayType,
    authorNames: StringArrayType,
    cachedAuthors: arrayOf(Author)
  },
  relationships: {
    authors: {
      type: Author,
      fkField: "authorIds"
    },
    authorsByName: {
      get type() {
        return Author;
      },
      fkField: "authorNames",
      keyField: "name"
    },
    mainAuthor: {
      type: Author,
      fkField: "mainAuthorId"
    },
    mainAuthorByName: {
      get type() {
        return Author;
      },
      fkField: "mainAuthorName",
      keyField: "name",
      oneToOne: true
    },
    subjects: {
      get type() {
        return Subject;
      },
      fkField: "_id",
      keyField: "bookIds"
    }
  }
};
