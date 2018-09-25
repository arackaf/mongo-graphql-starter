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
    keywordIds: StringArrayType,
    bookIds: StringArrayType
  },
  relationships: {
    keywords: {
      get type() {
        return Keyword;
      },
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
      get type() {
        return Subject;
      },
      fkField: "mainSubjectId"
    },
    subjects: {
      get type() {
        return Subject;
      },
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
    mainAuthorName: StringType,
    cachedMainAuthor: objectOf(Author),
    authorIds: StringArrayType,
    authorNames: StringArrayType,
    cachedAuthors: arrayOf(Author)
  },
  relationships: {
    authors: {
      get type() {
        return Author;
      },
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
      get type() {
        return Author;
      },
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
