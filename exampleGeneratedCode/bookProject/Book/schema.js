export const type = `

type Book {
  _id: String
  title: String
  pages: Int
  weight: Float
  authors: [Author]
  primaryAuthor: Author
  strArrs: [[String]]
  createdOn: String
  createdOnYearOnly: String
}

input BookInput {
  _id: String
  title: String
  pages: Int
  weight: Float
  authors: [AuthorInput]
  primaryAuthor: AuthorInput
  strArrs: [[String]]
  createdOn: String
  createdOnYearOnly: String
}

input BookMutationInput {
  title: String
  pages: Int
  weight: Float
  authors: [AuthorInput]
  primaryAuthor: AuthorInput
  strArrs: [[String]]
  createdOn: String
  createdOnYearOnly: String
}

input BookSort {
  _id: Int
  title: Int
  pages: Int
  weight: Int
  authors: Int
  primaryAuthor: Int
  strArrs: Int
  createdOn: Int
  createdOnYearOnly: Int
}
    
input BookFilters {
  _id: String
  _id_in: [String]
  title_contains: String
  title_startsWith: String
  title_endsWith: String
  title: String
  title_in: [String]
  pages_lt: Int
  pages_lte: Int
  pages_gt: Int
  pages_gte: Int
  pages: Int
  pages_in: [Int]
  weight_lt: Float
  weight_lte: Float
  weight_gt: Float
  weight_gte: Float
  weight: Float
  weight_in: [Float]
  createdOn_lt: String
  createdOn_lte: String
  createdOn_gt: String
  createdOn_gte: String
  createdOn: String
  createdOn_in: [String]
  createdOnYearOnly_lt: String
  createdOnYearOnly_lte: String
  createdOnYearOnly_gt: String
  createdOnYearOnly_gte: String
  createdOnYearOnly: String
  createdOnYearOnly_in: [String]
  OR: [BookFilters]
}

`;


export const mutation = `

  createBook(
    Book: BookInput
  ): Book

  updateBook(
    _id: String,
    Book: BookMutationInput
  ): Book

  deleteBook(
    _id: String
  ): Boolean

`;


export const query = `

  allBooks(
    _id: String,
    _id_in: [String],
    title_contains: String,
    title_startsWith: String,
    title_endsWith: String,
    title: String,
    title_in: [String],
    pages_lt: Int,
    pages_lte: Int,
    pages_gt: Int,
    pages_gte: Int,
    pages: Int,
    pages_in: [Int],
    weight_lt: Float,
    weight_lte: Float,
    weight_gt: Float,
    weight_gte: Float,
    weight: Float,
    weight_in: [Float],
    createdOn_lt: String,
    createdOn_lte: String,
    createdOn_gt: String,
    createdOn_gte: String,
    createdOn: String,
    createdOn_in: [String],
    createdOnYearOnly_lt: String,
    createdOnYearOnly_lte: String,
    createdOnYearOnly_gt: String,
    createdOnYearOnly_gte: String,
    createdOnYearOnly: String,
    createdOnYearOnly_in: [String],
    OR: [BookFilters],
    SORT: BookSort,
    SORTS: [BookSort],
    LIMIT: Int,
    SKIP: Int,
    PAGE: Int,
    PAGE_SIZE: Int,
    createdOn_format: String,
    createdOnYearOnly_format: String
  ): [Book]

  getBook(
    _id: String,
    createdOn_format: String,
    createdOnYearOnly_format: String
  ): Book

`;


