import {
  MongoIdType,
  StringType,
  StringArrayType,
  IntType,
  IntArrayType,
  FloatType,
  FloatArrayType,
  DateType,
  arrayOf,
  objectOf
} from "../../src/dataTypes";

export const Subject = {
  table: "subjects",
  fields: {
    _id: MongoIdType,
    name: StringType
  }
};

export const Tag = {
  fields: {
    name: StringType,
    description: StringType,
    timesUsed: IntType
  }
};

export const User = {
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

export const Comment = {
  fields: {
    text: StringType,
    upVotes: IntType,
    downVotes: IntType,
    author: objectOf(User),
    reviewers: arrayOf(User)
  }
};

export const Blog = {
  table: "blogs",
  fields: {
    author: objectOf(User),
    words: IntType,
    rating: FloatType,
    title: StringType,
    content: StringType,
    comments: arrayOf(Comment)
  }
};
