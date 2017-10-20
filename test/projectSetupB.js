import { dataTypes } from "mongo-graphql-starter";
const { MongoIdType, StringType, IntType, FloatType, DateType, arrayOf, objectOf, formattedDate, typeLiteral } = dataTypes;

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
    tagsSubscribed: arrayOf(Tag),
    favoriteTag: objectOf(Tag)
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
    author: objectOf(User),
    title: StringType,
    content: StringType,
    comments: arrayOf(Comment)
  }
};

export default {
  User,
  Blog,
  Comment,
  Tag
};
