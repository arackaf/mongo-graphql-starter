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
    },
    subjectJunkA: {
      get type() {
        return Subject;
      },
      fkField: "junk",
      keyField: "junk",
      oneToOne: true
    },
    subjectJunkB: {
      get type() {
        return Subject;
      },
      fkField: "junk",
      keyField: "junk",
      oneToMany: true
    }
  }
};

export const Author = {
  table: "authors",
  fields: {
    _idsM: MongoIdArrayType,
    _idsS: StringArrayType,
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
    books_idsS: {
      get type() {
        return Book;
      },
      fkField: "_idsS",
      keyField: "authorIds"
    },
    books_idsM: {
      get type() {
        return Book;
      },
      fkField: "_idsM",
      keyField: "authorIds"
    },
    books_idsS_Main: {
      get type() {
        return Book;
      },
      fkField: "_idsS",
      keyField: "mainAuthorId"
    },
    books_idsM_Main: {
      get type() {
        return Book;
      },
      fkField: "_idsM",
      keyField: "mainAuthorId"
    },
    books_readonly: {
      get type() {
        return Book;
      },
      fkField: "_id",
      keyField: "authorIds_readonly",
      readonly: true
    },
    mainAuthorBooks: {
      get type() {
        return Book;
      },
      fkField: "_id",
      keyField: "mainAuthorId"
    },
    mainAuthorBooks_readonly: {
      get type() {
        return Book;
      },
      fkField: "_id",
      keyField: "mainAuthorId_readonly",
      readonly: true
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
    mainAuthorId_readonly: MongoIdType,
    mainAuthorName: StringType,
    cachedMainAuthor: objectOf(Author),
    authorIds: MongoIdArrayType,
    authorIds_readonly: MongoIdArrayType,
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
    authors_readonly: {
      type: Author,
      fkField: "authorIds_readonly",
      readonly: true
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
    mainAuthor_readonly: {
      type: Author,
      fkField: "mainAuthorId_readonly",
      readonly: true
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
