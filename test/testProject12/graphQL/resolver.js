import GraphQLJSON from "graphql-type-json";

import Book, { Book as BookRest } from "./Book/resolver";
import Subject, { Subject as SubjectRest } from "./Subject/resolver";
import Tag, { Tag as TagRest } from "./Tag/resolver";
import ReadonlyTag, { ReadonlyTag as ReadonlyTagRest } from "./ReadonlyTag/resolver";

const { Query: BookQuery, Mutation: BookMutation } = Book;
const { Query: SubjectQuery, Mutation: SubjectMutation } = Subject;
const { Query: TagQuery, Mutation: TagMutation } = Tag;
const { Query: ReadonlyTagQuery, Mutation: ReadonlyTagMutation } = ReadonlyTag;

export default {
  JSON: GraphQLJSON,
  Query: Object.assign({}, BookQuery, SubjectQuery, TagQuery, ReadonlyTagQuery),
  Mutation: Object.assign({}, BookMutation, SubjectMutation, TagMutation),
  Book: { ...BookRest },
  Subject: { ...SubjectRest },
  Tag: { ...TagRest },
  ReadonlyTag: { ...ReadonlyTagRest }
};
