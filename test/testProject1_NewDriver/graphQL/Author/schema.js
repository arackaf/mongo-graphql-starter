export const type = `
  
  type Author {
    name: String
    birthday: String
    strings: [String]
  }

  input AuthorInput {
    name: String
    birthday: String
    strings: [String]
  }

  input AuthorMutationInput {
    name: String
    birthday: String
    strings: [String]
    strings_PUSH: String
    strings_CONCAT: [String]
    strings_UPDATE: StringArrayUpdate
    strings_UPDATES: [StringArrayUpdate]
    strings_PULL: [String]
    strings_ADDTOSET: [String]
  }

  input AuthorArrayMutationInput {
    index: Int
    Updates: AuthorMutationInput
  }

  input AuthorSort {
    name: Int
    birthday: Int
    strings: Int
  }

  input AuthorFilters {
    name_contains: String
    name_startsWith: String
    name_endsWith: String
    name_regex: String
    name: String
    name_ne: String
    name_in: [String]
    birthday_lt: String
    birthday_lte: String
    birthday_gt: String
    birthday_gte: String
    birthday: String
    birthday_ne: String
    birthday_in: [String]
    strings_count: Int
    strings_textContains: String
    strings_startsWith: String
    strings_endsWith: String
    strings_regex: String
    strings: [String]
    strings_in: [[String]]
    strings_contains: String
    strings_containsAny: [String]
    strings_ne: [String]
    OR: [AuthorFilters]
  }
  
`;
  
  
  
