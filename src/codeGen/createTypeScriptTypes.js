import fs from "fs";
import path from "path";

import { codegen } from "@graphql-codegen/core";
import { plugin as typescriptPlugin } from "@graphql-codegen/typescript";

import { buildSchema, printSchema, parse } from "graphql";

const schemaText = `

type DeletionResultInfo {
  success: Boolean
  Meta: MutationResultInfo
}

type MutationResultInfo {
  transaction: Boolean
  elapsedTime: Int
}

`;

async function createTypeScriptTypes(outputFile) {
  const schema = buildSchema(schemaText);

  const config = {
    // used by a plugin internally, although the 'typescript' plugin currently
    // returns the string output, rather than writing to a file
    filename: outputFile,
    schema: parse(printSchema(schema)),
    plugins: {
      typescript: {} // Here you can pass configuration to the plugin
    },
    pluginMap: {
      typescript: {
        plugin: typescriptPlugin
      }
    }
  };

  const output = await codegen(config);
  fs.writeFile(path.join(__dirname, outputFile), output, () => {
    console.log("Outputs generated!");
  });
}

createTypeScriptTypes("test.ts");

const XXX = `


type QueryResultsMetadata {
  count: Int
}

input StringArrayUpdate {
  index: Int
  value: String
}

input IntArrayUpdate {
  index: Int
  value: Int
}

input FloatArrayUpdate {
  index: Int
  value: Float
}

type Tag {
  name: String
  description: String
  timesUsed: Int
}

input TagInput {
  name: String
  description: String
  timesUsed: Int
}

input TagMutationInput {
  name: String
  description: String
  timesUsed: Int
  timesUsed_INC: Int
  timesUsed_DEC: Int
}

input TagArrayMutationInput {
  index: Int
  Updates: TagMutationInput
}

input TagSort {
  name: Int
  description: Int
  timesUsed: Int
}

input TagFilters {
  name_contains: String
  name_startsWith: String
  name_endsWith: String
  name_regex: String
  name: String
  name_ne: String
  name_in: [String]
  description_contains: String
  description_startsWith: String
  description_endsWith: String
  description_regex: String
  description: String
  description_ne: String
  description_in: [String]
  timesUsed_lt: Int
  timesUsed_lte: Int
  timesUsed_gt: Int
  timesUsed_gte: Int
  timesUsed: Int
  timesUsed_ne: Int
  timesUsed_in: [Int]
  OR: [TagFilters]
}

type User {
  name: String
  knicknames: [String]
  luckyNumbers: [Int]
  weights: [Float]
  birthday: String
  tagsSubscribed: [Tag]
  favoriteTag: Tag
}

input UserInput {
  name: String
  knicknames: [String]
  luckyNumbers: [Int]
  weights: [Float]
  birthday: String
  tagsSubscribed: [TagInput]
  favoriteTag: TagInput
}

input UserMutationInput {
  name: String
  knicknames: [String]
  knicknames_PUSH: String
  knicknames_CONCAT: [String]
  knicknames_UPDATE: StringArrayUpdate
  knicknames_UPDATES: [StringArrayUpdate]
  knicknames_PULL: [String]
  knicknames_ADDTOSET: [String]
  luckyNumbers: [Int]
  luckyNumbers_PUSH: Int
  luckyNumbers_CONCAT: [Int]
  luckyNumbers_UPDATE: IntArrayUpdate
  luckyNumbers_UPDATES: [IntArrayUpdate]
  luckyNumbers_PULL: [Int]
  luckyNumbers_ADDTOSET: [Int]
  weights: [Float]
  weights_PUSH: Float
  weights_CONCAT: [Float]
  weights_UPDATE: FloatArrayUpdate
  weights_UPDATES: [FloatArrayUpdate]
  weights_PULL: [Float]
  weights_ADDTOSET: [Float]
  birthday: String
  tagsSubscribed: [TagInput]
  tagsSubscribed_PUSH: TagInput
  tagsSubscribed_CONCAT: [TagInput]
  tagsSubscribed_UPDATE: TagArrayMutationInput
  tagsSubscribed_UPDATES: [TagArrayMutationInput]
  tagsSubscribed_PULL: TagFilters
  favoriteTag: TagInput
  favoriteTag_UPDATE: TagMutationInput
}

input UserArrayMutationInput {
  index: Int
  Updates: UserMutationInput
}

input UserSort {
  name: Int
  knicknames: Int
  luckyNumbers: Int
  weights: Int
  birthday: Int
  tagsSubscribed: Int
  favoriteTag: Int
}

input UserFilters {
  name_contains: String
  name_startsWith: String
  name_endsWith: String
  name_regex: String
  name: String
  name_ne: String
  name_in: [String]
  knicknames_count: Int
  knicknames_textContains: String
  knicknames_startsWith: String
  knicknames_endsWith: String
  knicknames_regex: String
  knicknames: [String]
  knicknames_in: [[String]]
  knicknames_contains: String
  knicknames_containsAny: [String]
  knicknames_ne: [String]
  luckyNumbers_count: Int
  luckyNumbers_lt: Int
  luckyNumbers_lte: Int
  luckyNumbers_gt: Int
  luckyNumbers_gte: Int
  luckyNumbers_emlt: Int
  luckyNumbers_emlte: Int
  luckyNumbers_emgt: Int
  luckyNumbers_emgte: Int
  luckyNumbers: [Int]
  luckyNumbers_in: [[Int]]
  luckyNumbers_contains: Int
  luckyNumbers_containsAny: [Int]
  luckyNumbers_ne: [Int]
  weights_count: Int
  weights_lt: Float
  weights_lte: Float
  weights_gt: Float
  weights_gte: Float
  weights_emlt: Float
  weights_emlte: Float
  weights_emgt: Float
  weights_emgte: Float
  weights: [Float]
  weights_in: [[Float]]
  weights_contains: Float
  weights_containsAny: [Float]
  weights_ne: [Float]
  birthday_lt: String
  birthday_lte: String
  birthday_gt: String
  birthday_gte: String
  birthday: String
  birthday_ne: String
  birthday_in: [String]
  tagsSubscribed_count: Int
  tagsSubscribed: TagFilters
  favoriteTag: TagFilters
  OR: [UserFilters]
}

type Comment {
  text: String
  upVotes: Int
  downVotes: Int
  author: User
  reviewers: [User]
}

input CommentInput {
  text: String
  upVotes: Int
  downVotes: Int
  author: UserInput
  reviewers: [UserInput]
}

input CommentMutationInput {
  text: String
  upVotes: Int
  upVotes_INC: Int
  upVotes_DEC: Int
  downVotes: Int
  downVotes_INC: Int
  downVotes_DEC: Int
  author: UserInput
  author_UPDATE: UserMutationInput
  reviewers: [UserInput]
  reviewers_PUSH: UserInput
  reviewers_CONCAT: [UserInput]
  reviewers_UPDATE: UserArrayMutationInput
  reviewers_UPDATES: [UserArrayMutationInput]
  reviewers_PULL: UserFilters
}

input CommentArrayMutationInput {
  index: Int
  Updates: CommentMutationInput
}

input CommentSort {
  text: Int
  upVotes: Int
  downVotes: Int
  author: Int
  reviewers: Int
}

input CommentFilters {
  text_contains: String
  text_startsWith: String
  text_endsWith: String
  text_regex: String
  text: String
  text_ne: String
  text_in: [String]
  upVotes_lt: Int
  upVotes_lte: Int
  upVotes_gt: Int
  upVotes_gte: Int
  upVotes: Int
  upVotes_ne: Int
  upVotes_in: [Int]
  downVotes_lt: Int
  downVotes_lte: Int
  downVotes_gt: Int
  downVotes_gte: Int
  downVotes: Int
  downVotes_ne: Int
  downVotes_in: [Int]
  author: UserFilters
  reviewers_count: Int
  reviewers: UserFilters
  OR: [CommentFilters]
}

type Subject {
  _id: String
  name: String
}

type SubjectQueryResults {
  Subjects: [Subject]
  Meta: QueryResultsMetadata
}

type SubjectSingleQueryResult {
  Subject: Subject
}

type SubjectMutationResult {
  Subject: Subject
  success: Boolean
  Meta: MutationResultInfo
}

type SubjectMutationResultMulti {
  Subjects: [Subject]
  success: Boolean
  Meta: MutationResultInfo
}

type SubjectBulkMutationResult {
  success: Boolean
  Meta: MutationResultInfo
}

input SubjectInput {
  _id: String
  name: String
}

input SubjectMutationInput {
  name: String
}

input SubjectSort {
  _id: Int
  name: Int
}

input SubjectFilters {
  _id: String
  _id_ne: String
  _id_in: [String]
  name_contains: String
  name_startsWith: String
  name_endsWith: String
  name_regex: String
  name: String
  name_ne: String
  name_in: [String]
  OR: [SubjectFilters]
}

type Blog {
  _id: String
  author: User
  words: Int
  rating: Float
  title: String
  content: String
  comments: [Comment]
}

type BlogQueryResults {
  Blogs: [Blog]
  Meta: QueryResultsMetadata
}

type BlogSingleQueryResult {
  Blog: Blog
}

type BlogMutationResult {
  Blog: Blog
  success: Boolean
  Meta: MutationResultInfo
}

type BlogMutationResultMulti {
  Blogs: [Blog]
  success: Boolean
  Meta: MutationResultInfo
}

type BlogBulkMutationResult {
  success: Boolean
  Meta: MutationResultInfo
}

input BlogInput {
  _id: String
  author: UserInput
  words: Int
  rating: Float
  title: String
  content: String
  comments: [CommentInput]
}

input BlogMutationInput {
  author: UserInput
  author_UPDATE: UserMutationInput
  words: Int
  words_INC: Int
  words_DEC: Int
  rating: Float
  rating_INC: Int
  rating_DEC: Int
  title: String
  content: String
  comments: [CommentInput]
  comments_PUSH: CommentInput
  comments_CONCAT: [CommentInput]
  comments_UPDATE: CommentArrayMutationInput
  comments_UPDATES: [CommentArrayMutationInput]
  comments_PULL: CommentFilters
}

input BlogSort {
  _id: Int
  author: Int
  words: Int
  rating: Int
  title: Int
  content: Int
  comments: Int
}

input BlogFilters {
  _id: String
  _id_ne: String
  _id_in: [String]
  author: UserFilters
  words_lt: Int
  words_lte: Int
  words_gt: Int
  words_gte: Int
  words: Int
  words_ne: Int
  words_in: [Int]
  rating_lt: Float
  rating_lte: Float
  rating_gt: Float
  rating_gte: Float
  rating: Float
  rating_ne: Float
  rating_in: [Float]
  title_contains: String
  title_startsWith: String
  title_endsWith: String
  title_regex: String
  title: String
  title_ne: String
  title_in: [String]
  content_contains: String
  content_startsWith: String
  content_endsWith: String
  content_regex: String
  content: String
  content_ne: String
  content_in: [String]
  comments_count: Int
  comments: CommentFilters
  OR: [BlogFilters]
}

type Query {
  allSubjects(
    _id: String
    _id_ne: String
    _id_in: [String]
    name_contains: String
    name_startsWith: String
    name_endsWith: String
    name_regex: String
    name: String
    name_ne: String
    name_in: [String]
    OR: [SubjectFilters]
    SORT: SubjectSort
    SORTS: [SubjectSort]
    LIMIT: Int
    SKIP: Int
    PAGE: Int
    PAGE_SIZE: Int
  ): SubjectQueryResults

  getSubject(_id: String): SubjectSingleQueryResult

  allBlogs(
    _id: String
    _id_ne: String
    _id_in: [String]
    author: UserFilters
    words_lt: Int
    words_lte: Int
    words_gt: Int
    words_gte: Int
    words: Int
    words_ne: Int
    words_in: [Int]
    rating_lt: Float
    rating_lte: Float
    rating_gt: Float
    rating_gte: Float
    rating: Float
    rating_ne: Float
    rating_in: [Float]
    title_contains: String
    title_startsWith: String
    title_endsWith: String
    title_regex: String
    title: String
    title_ne: String
    title_in: [String]
    content_contains: String
    content_startsWith: String
    content_endsWith: String
    content_regex: String
    content: String
    content_ne: String
    content_in: [String]
    comments_count: Int
    comments: CommentFilters
    OR: [BlogFilters]
    SORT: BlogSort
    SORTS: [BlogSort]
    LIMIT: Int
    SKIP: Int
    PAGE: Int
    PAGE_SIZE: Int
  ): BlogQueryResults

  getBlog(_id: String): BlogSingleQueryResult
}

type Mutation {
  createSubject(Subject: SubjectInput): SubjectMutationResult

  updateSubject(
    _id: String
    Updates: SubjectMutationInput
  ): SubjectMutationResult

  updateSubjects(
    _ids: [String]
    Updates: SubjectMutationInput
  ): SubjectMutationResultMulti

  updateSubjectsBulk(
    Match: SubjectFilters
    Updates: SubjectMutationInput
  ): SubjectBulkMutationResult

  deleteSubject(_id: String): DeletionResultInfo

  createBlog(Blog: BlogInput): BlogMutationResult

  updateBlog(_id: String, Updates: BlogMutationInput): BlogMutationResult

  updateBlogs(
    _ids: [String]
    Updates: BlogMutationInput
  ): BlogMutationResultMulti

  updateBlogsBulk(
    Match: BlogFilters
    Updates: BlogMutationInput
  ): BlogBulkMutationResult

  deleteBlog(_id: String): DeletionResultInfo
}



`;
