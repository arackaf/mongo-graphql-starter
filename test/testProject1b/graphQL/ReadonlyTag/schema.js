export const type = `
  
  type ReadonlyTag {
    _id: String
    name: String
    count: Int
  }

  type ReadonlyTagQueryResults {
    ReadonlyTags: [ReadonlyTag!]!
    Meta: QueryResultsMetadata!
  }

  type ReadonlyTagSingleQueryResult {
    ReadonlyTag: ReadonlyTag
  }

  type ReadonlyTagMutationResult {
    ReadonlyTag: ReadonlyTag
    success: Boolean!
    Meta: MutationResultInfo!
  }

  type ReadonlyTagMutationResultMulti {
    ReadonlyTags: [ReadonlyTag]
    success: Boolean!
    Meta: MutationResultInfo!
  }

  type ReadonlyTagBulkMutationResult {
    success: Boolean!
    Meta: MutationResultInfo!
  }

  input ReadonlyTagInput {
    _id: String
    name: String
    count: Int
  }

  input ReadonlyTagMutationInput {
    name: String
    count: Int
    count_INC: Int
    count_DEC: Int
  }

  input ReadonlyTagSort {
    _id: Int
    name: Int
    count: Int
  }

  input ReadonlyTagFilters {
    _id: String
    _id_ne: String
    _id_in: [String]
    _id_nin: [String]
    name_contains: String
    name_startsWith: String
    name_endsWith: String
    name_regex: String
    name: String
    name_ne: String
    name_in: [String]
    name_nin: [String]
    count_lt: Int
    count_lte: Int
    count_gt: Int
    count_gte: Int
    count: Int
    count_ne: Int
    count_in: [Int]
    count_nin: [Int]
    OR: [ReadonlyTagFilters]
  }
  
`;

export const mutation = `



`;

export const query = `

  allReadonlyTags (
    _id: String,
    _id_ne: String,
    _id_in: [String],
    _id_nin: [String],
    name_contains: String,
    name_startsWith: String,
    name_endsWith: String,
    name_regex: String,
    name: String,
    name_ne: String,
    name_in: [String],
    name_nin: [String],
    count_lt: Int,
    count_lte: Int,
    count_gt: Int,
    count_gte: Int,
    count: Int,
    count_ne: Int,
    count_in: [Int],
    count_nin: [Int],
    OR: [ReadonlyTagFilters],
    SORT: ReadonlyTagSort,
    SORTS: [ReadonlyTagSort],
    LIMIT: Int,
    SKIP: Int,
    PAGE: Int,
    PAGE_SIZE: Int
  ): ReadonlyTagQueryResults!

  getReadonlyTag (
    _id: String
  ): ReadonlyTagSingleQueryResult!

`;
