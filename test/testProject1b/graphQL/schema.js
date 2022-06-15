import { query as BookQuery, mutation as BookMutation, type as BookType } from "./Book/schema";
import { query as SubjectQuery, mutation as SubjectMutation, type as SubjectType } from "./Subject/schema";
import { query as TagQuery, mutation as TagMutation, type as TagType } from "./Tag/schema";
import {
  query as ReadonlyTagQuery,
  mutation as ReadonlyTagMutation,
  type as ReadonlyTagType
} from "./ReadonlyTag/schema";
import { type as AuthorType } from "./Author/schema";

export default `

  scalar JSON

  type DeletionResultInfo {
    success: Boolean!,
    Meta: MutationResultInfo!
  }

  type MutationResultInfo {
    transaction: Boolean!,
    elapsedTime: Int!
  }

  type QueryResultsMetadata {
    count: Int!
  }

  type QueryRelationshipResultsMetadata {
    count: Int!
  }

  input StringArrayUpdate {
    index: Int!,
    value: String!
  }

  input IntArrayUpdate {
    index: Int!,
    value: Int!
  }

  input FloatArrayUpdate {
    index: Int!,
    value: Float!
  }


  ${AuthorType}

  ${BookType}

  ${SubjectType}

  ${TagType}

  ${ReadonlyTagType}

  type Query {
    ${BookQuery}

    ${SubjectQuery}

    ${TagQuery}

    ${ReadonlyTagQuery}
  }

  type Mutation {
    ${BookMutation}

    ${SubjectMutation}

    ${TagMutation}
  }

  

`;
