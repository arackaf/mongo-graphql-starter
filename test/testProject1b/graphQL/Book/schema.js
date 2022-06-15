export const type = `
  
  type Book {
    _id: String
    title: String
    pages: Int
    weight: Float
    keywords: [String]
    editions: [Int]
    prices: [Float]
    isRead: Boolean
    mongoId: String
    mongoIds: [String]
    authors: [Author]
    primaryAuthor: Author
    strArrs: [[String]]
    createdOn: String
    createdOnYearOnly: String
    jsonContent: JSON
    nq__id: String
    nq_str: String
    nq_strArr: [String]
    nq_bool: Boolean
    nq_int: Int
    nq_intArr: [Int]
    nq_float: Float
    nq_floatArr: [Float]
    nq_date: String
    nq_json: JSON
  }

  type BookQueryResults {
    Books: [Book!]!
    Meta: QueryResultsMetadata!
  }

  type BookSingleQueryResult {
    Book: Book
  }

  type BookMutationResult {
    Book: Book
    success: Boolean!
    Meta: MutationResultInfo!
  }

  type BookMutationResultMulti {
    Books: [Book]
    success: Boolean!
    Meta: MutationResultInfo!
  }

  type BookBulkMutationResult {
    success: Boolean!
    Meta: MutationResultInfo!
  }

  input BookInput {
    _id: String
    title: String
    pages: Int
    weight: Float
    keywords: [String]
    editions: [Int]
    prices: [Float]
    isRead: Boolean
    mongoId: String
    mongoIds: [String]
    authors: [AuthorInput]
    primaryAuthor: AuthorInput
    strArrs: [[String]]
    createdOn: String
    createdOnYearOnly: String
    jsonContent: JSON
    nq__id: String
    nq_str: String
    nq_strArr: [String]
    nq_bool: Boolean
    nq_int: Int
    nq_intArr: [Int]
    nq_float: Float
    nq_floatArr: [Float]
    nq_date: String
    nq_json: JSON
  }

  input BookMutationInput {
    title: String
    pages: Int
    pages_INC: Int
    pages_DEC: Int
    weight: Float
    weight_INC: Int
    weight_DEC: Int
    keywords: [String]
    keywords_PUSH: String
    keywords_CONCAT: [String]
    keywords_UPDATE: StringArrayUpdate
    keywords_UPDATES: [StringArrayUpdate]
    keywords_PULL: [String]
    keywords_ADDTOSET: [String]
    editions: [Int]
    editions_PUSH: Int
    editions_CONCAT: [Int]
    editions_UPDATE: IntArrayUpdate
    editions_UPDATES: [IntArrayUpdate]
    editions_PULL: [Int]
    editions_ADDTOSET: [Int]
    prices: [Float]
    prices_PUSH: Float
    prices_CONCAT: [Float]
    prices_UPDATE: FloatArrayUpdate
    prices_UPDATES: [FloatArrayUpdate]
    prices_PULL: [Float]
    prices_ADDTOSET: [Float]
    isRead: Boolean
    mongoId: String
    mongoIds: [String]
    mongoIds_PUSH: String
    mongoIds_CONCAT: [String]
    mongoIds_UPDATE: StringArrayUpdate
    mongoIds_UPDATES: [StringArrayUpdate]
    mongoIds_PULL: [String]
    mongoIds_ADDTOSET: [String]
    authors: [AuthorInput]
    authors_PUSH: AuthorInput
    authors_CONCAT: [AuthorInput]
    authors_UPDATE: AuthorArrayMutationInput
    authors_UPDATES: [AuthorArrayMutationInput]
    authors_PULL: AuthorFilters
    primaryAuthor: AuthorInput
    primaryAuthor_UPDATE: AuthorMutationInput
    strArrs: [[String]]
    createdOn: String
    createdOnYearOnly: String
    jsonContent: JSON
    nq__id: String
    nq_str: String
    nq_strArr: [String]
    nq_strArr_PUSH: String
    nq_strArr_CONCAT: [String]
    nq_strArr_UPDATE: StringArrayUpdate
    nq_strArr_UPDATES: [StringArrayUpdate]
    nq_strArr_PULL: [String]
    nq_strArr_ADDTOSET: [String]
    nq_bool: Boolean
    nq_int: Int
    nq_int_INC: Int
    nq_int_DEC: Int
    nq_intArr: [Int]
    nq_intArr_PUSH: Int
    nq_intArr_CONCAT: [Int]
    nq_intArr_UPDATE: IntArrayUpdate
    nq_intArr_UPDATES: [IntArrayUpdate]
    nq_intArr_PULL: [Int]
    nq_intArr_ADDTOSET: [Int]
    nq_float: Float
    nq_float_INC: Int
    nq_float_DEC: Int
    nq_floatArr: [Float]
    nq_floatArr_PUSH: Float
    nq_floatArr_CONCAT: [Float]
    nq_floatArr_UPDATE: FloatArrayUpdate
    nq_floatArr_UPDATES: [FloatArrayUpdate]
    nq_floatArr_PULL: [Float]
    nq_floatArr_ADDTOSET: [Float]
    nq_date: String
    nq_json: JSON
  }

  input BookSort {
    _id: Int
    title: Int
    pages: Int
    weight: Int
    keywords: Int
    editions: Int
    prices: Int
    isRead: Int
    mongoId: Int
    mongoIds: Int
    authors: Int
    primaryAuthor: Int
    strArrs: Int
    createdOn: Int
    createdOnYearOnly: Int
    nq__id: Int
    nq_str: Int
    nq_strArr: Int
    nq_bool: Int
    nq_int: Int
    nq_intArr: Int
    nq_float: Int
    nq_floatArr: Int
    nq_date: Int
  }

  input BookFilters {
    _id: String
    _id_ne: String
    _id_in: [String]
    _id_nin: [String]
    title_contains: String
    title_startsWith: String
    title_endsWith: String
    title_regex: String
    title: String
    title_ne: String
    title_in: [String]
    title_nin: [String]
    pages_lt: Int
    pages_lte: Int
    pages_gt: Int
    pages_gte: Int
    pages: Int
    pages_ne: Int
    pages_in: [Int]
    pages_nin: [Int]
    weight_lt: Float
    weight_lte: Float
    weight_gt: Float
    weight_gte: Float
    weight: Float
    weight_ne: Float
    weight_in: [Float]
    weight_nin: [Float]
    keywords_count: Int
    keywords_textContains: String
    keywords_startsWith: String
    keywords_endsWith: String
    keywords_regex: String
    keywords: [String]
    keywords_in: [[String]]
    keywords_nin: [[String]]
    keywords_contains: String
    keywords_containsAny: [String]
    keywords_containsAll: [String]
    keywords_ne: [String]
    editions_count: Int
    editions_lt: Int
    editions_lte: Int
    editions_gt: Int
    editions_gte: Int
    editions_emlt: Int
    editions_emlte: Int
    editions_emgt: Int
    editions_emgte: Int
    editions: [Int]
    editions_in: [[Int]]
    editions_nin: [[Int]]
    editions_contains: Int
    editions_containsAny: [Int]
    editions_containsAll: [Int]
    editions_ne: [Int]
    prices_count: Int
    prices_lt: Float
    prices_lte: Float
    prices_gt: Float
    prices_gte: Float
    prices_emlt: Float
    prices_emlte: Float
    prices_emgt: Float
    prices_emgte: Float
    prices: [Float]
    prices_in: [[Float]]
    prices_nin: [[Float]]
    prices_contains: Float
    prices_containsAny: [Float]
    prices_containsAll: [Float]
    prices_ne: [Float]
    isRead: Boolean
    isRead_ne: Boolean
    isRead_in: [Boolean]
    isRead_nin: [Boolean]
    mongoId: String
    mongoId_ne: String
    mongoId_in: [String]
    mongoId_nin: [String]
    mongoIds: [String]
    mongoIds_in: [[String]]
    mongoIds_nin: [[String]]
    mongoIds_contains: String
    mongoIds_containsAny: [String]
    mongoIds_containsAll: [String]
    mongoIds_ne: [String]
    authors_count: Int
    authors: AuthorFilters
    primaryAuthor: AuthorFilters
    createdOn_lt: String
    createdOn_lte: String
    createdOn_gt: String
    createdOn_gte: String
    createdOn: String
    createdOn_ne: String
    createdOn_in: [String]
    createdOn_nin: [String]
    createdOnYearOnly_lt: String
    createdOnYearOnly_lte: String
    createdOnYearOnly_gt: String
    createdOnYearOnly_gte: String
    createdOnYearOnly: String
    createdOnYearOnly_ne: String
    createdOnYearOnly_in: [String]
    createdOnYearOnly_nin: [String]
    jsonContent: JSON
    jsonContent_ne: JSON
    jsonContent_in: [JSON]
    jsonContent_nin: [JSON]
    OR: [BookFilters]
  }
  
`;

export const mutation = `

  createBook (
    Book: BookInput
  ): BookMutationResult

  updateBook (
    _id: String,
    Updates: BookMutationInput
  ): BookMutationResult

  updateBooks (
    _ids: [String],
    Updates: BookMutationInput
  ): BookMutationResultMulti

  updateBooksBulk (
    Match: BookFilters,
    Updates: BookMutationInput
  ): BookBulkMutationResult

  deleteBook (
    _id: String
  ): DeletionResultInfo

`;

export const query = `

  allBooks (
    _id: String,
    _id_ne: String,
    _id_in: [String],
    _id_nin: [String],
    title_contains: String,
    title_startsWith: String,
    title_endsWith: String,
    title_regex: String,
    title: String,
    title_ne: String,
    title_in: [String],
    title_nin: [String],
    pages_lt: Int,
    pages_lte: Int,
    pages_gt: Int,
    pages_gte: Int,
    pages: Int,
    pages_ne: Int,
    pages_in: [Int],
    pages_nin: [Int],
    weight_lt: Float,
    weight_lte: Float,
    weight_gt: Float,
    weight_gte: Float,
    weight: Float,
    weight_ne: Float,
    weight_in: [Float],
    weight_nin: [Float],
    keywords_count: Int,
    keywords_textContains: String,
    keywords_startsWith: String,
    keywords_endsWith: String,
    keywords_regex: String,
    keywords: [String],
    keywords_in: [[String]],
    keywords_nin: [[String]],
    keywords_contains: String,
    keywords_containsAny: [String],
    keywords_containsAll: [String],
    keywords_ne: [String],
    editions_count: Int,
    editions_lt: Int,
    editions_lte: Int,
    editions_gt: Int,
    editions_gte: Int,
    editions_emlt: Int,
    editions_emlte: Int,
    editions_emgt: Int,
    editions_emgte: Int,
    editions: [Int],
    editions_in: [[Int]],
    editions_nin: [[Int]],
    editions_contains: Int,
    editions_containsAny: [Int],
    editions_containsAll: [Int],
    editions_ne: [Int],
    prices_count: Int,
    prices_lt: Float,
    prices_lte: Float,
    prices_gt: Float,
    prices_gte: Float,
    prices_emlt: Float,
    prices_emlte: Float,
    prices_emgt: Float,
    prices_emgte: Float,
    prices: [Float],
    prices_in: [[Float]],
    prices_nin: [[Float]],
    prices_contains: Float,
    prices_containsAny: [Float],
    prices_containsAll: [Float],
    prices_ne: [Float],
    isRead: Boolean,
    isRead_ne: Boolean,
    isRead_in: [Boolean],
    isRead_nin: [Boolean],
    mongoId: String,
    mongoId_ne: String,
    mongoId_in: [String],
    mongoId_nin: [String],
    mongoIds: [String],
    mongoIds_in: [[String]],
    mongoIds_nin: [[String]],
    mongoIds_contains: String,
    mongoIds_containsAny: [String],
    mongoIds_containsAll: [String],
    mongoIds_ne: [String],
    authors_count: Int,
    authors: AuthorFilters,
    primaryAuthor: AuthorFilters,
    createdOn_lt: String,
    createdOn_lte: String,
    createdOn_gt: String,
    createdOn_gte: String,
    createdOn: String,
    createdOn_ne: String,
    createdOn_in: [String],
    createdOn_nin: [String],
    createdOnYearOnly_lt: String,
    createdOnYearOnly_lte: String,
    createdOnYearOnly_gt: String,
    createdOnYearOnly_gte: String,
    createdOnYearOnly: String,
    createdOnYearOnly_ne: String,
    createdOnYearOnly_in: [String],
    createdOnYearOnly_nin: [String],
    jsonContent: JSON,
    jsonContent_ne: JSON,
    jsonContent_in: [JSON],
    jsonContent_nin: [JSON],
    OR: [BookFilters],
    SORT: BookSort,
    SORTS: [BookSort],
    LIMIT: Int,
    SKIP: Int,
    PAGE: Int,
    PAGE_SIZE: Int,
    createdOn_format: String,
    createdOnYearOnly_format: String,
    nq_date_format: String
  ): BookQueryResults!

  getBook (
    _id: String,
    createdOn_format: String,
    createdOnYearOnly_format: String,
    nq_date_format: String
  ): BookSingleQueryResult!

`;
