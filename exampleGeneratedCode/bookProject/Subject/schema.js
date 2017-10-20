export const type = `

type Subject {
  _id: String
  name: String
}

input SubjectInput {
  _id: String
  name: String
}

input SubjectSort {
  _id: Int
  name: Int
}

input SubjectFilters {
  _id: String
  _id_in: [String]
  name_contains: String
  name_startsWith: String
  name_endsWith: String
  name: String
  name_in: [String]
  OR: [SubjectFilters]
}

`;



export const mutation = `

  createSubject(
    _id: String,
    name: String
  ): Subject

  updateSubject(
    _id: String,
    name: String
  ): Subject

  deleteSubject(
    _id: String
  ): Boolean

`;

export const query = `

  allSubjects(
    _id: String,
    _id_in: [String],
    name_contains: String,
    name_startsWith: String,
    name_endsWith: String,
    name: String,
    name_in: [String],
    OR: [SubjectFilters],
    SORT: SubjectSort,
    SORTS: [SubjectSort],
    LIMIT: Int,
    SKIP: Int,
    PAGE: Int,
    PAGE_SIZE: Int
  ): [Subject]

  getSubject(
    _id: String
  ): Subject

`;


