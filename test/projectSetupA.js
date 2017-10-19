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

const Tag = {
  fields: {
    name: StringType
  }
};

const User = {
  fields: {
    name: StringType,
    birthday: DateType,
    tagsSubscribed: arrayOf(Tag)
  }
};

const Comment = {
  fields: {
    text: StringType,
    upVotes: IntType,
    downVotes: IntType,
    author: objectOf(User),
    reviewers: arrayOf(User)
  }
};

const Blog = {
  table: "blogs",
  fields: {
    title: StringType,
    content: StringType,
    comments: arrayOf(Comment)
  }
};

export default {
  Book,
  Subject,
  User,
  Blog,
  Comment,
  Tag,
  Author
};
