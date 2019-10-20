export default `
  scalar JSON

  type DeletionResultInfo {
    success: Boolean!,
    Meta: MutationResultInfo!
  }

  type MutationResultInfo {
    transaction: Boolean!,
    elapsedTime: Float!
  }
  
  type QueryResultsMetadata {
    count: Int!
    queryElapsedTime: Float!
    countElapsedTime: Float!
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
`;
