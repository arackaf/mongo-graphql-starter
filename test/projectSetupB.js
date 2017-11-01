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
  typeLiteral
} = dataTypes;

const Subject = {
  table: "subjects",
  fields: {
    _id: MongoIdType,
    name: StringType
  }
};

const Tag = {
  fields: {
    name: StringType,
    description: StringType,
    timesUsed: IntType
  }
};

const User = {
  fields: {
    name: StringType,
    knicknames: StringArrayType,
    luckyNumbers: IntArrayType,
    weights: FloatArrayType,
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
    words: IntType,
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
