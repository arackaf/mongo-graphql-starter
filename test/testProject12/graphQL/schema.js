import { query as Thing1Query, mutation as Thing1Mutation, type as Thing1Type } from "./Thing1/schema";

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


  ${Thing1Type}

  type Query {
    ${Thing1Query}
  }

  type Mutation {
    ${Thing1Mutation}
  }

  

`;
