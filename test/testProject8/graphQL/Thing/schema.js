export const type = `
  
  type Thing {
    _id: String
    name: String
    strs: [String]
    ints: [Int]
    floats: [Float]
  
  }
  
  type ThingQueryResults {
    Things: [Thing],
    Meta: QueryResultsMetadata
  }

  type ThingSingleQueryResult {
    Thing: Thing
  }

  type ThingMutationResult {
    Thing: Thing
  }

  input ThingInput {
    _id: String
    name: String
    strs: [String]
    ints: [Int]
    floats: [Float]
  }
  
  input ThingMutationInput {
    name: String
    strs: [String]
    strs_PUSH: String
    strs_CONCAT: [String]
    strs_UPDATE: StringArrayUpdate
    strs_UPDATES: [StringArrayUpdate]
    strs_PULL: [String]
    ints: [Int]
    ints_PUSH: Int
    ints_CONCAT: [Int]
    ints_UPDATE: IntArrayUpdate
    ints_UPDATES: [IntArrayUpdate]
    ints_PULL: [Int]
    floats: [Float]
    floats_PUSH: Float
    floats_CONCAT: [Float]
    floats_UPDATE: FloatArrayUpdate
    floats_UPDATES: [FloatArrayUpdate]
    floats_PULL: [Float]
  }
  
  input ThingSort {
    _id: Int
    name: Int
    strs: Int
    ints: Int
    floats: Int
  }
      
  input ThingFilters {
    _id: String
    _id_ne: String
    _id_in: [String]
    name_contains: String
    name_startsWith: String
    name_endsWith: String
    name: String
    name_ne: String
    name_in: [String]
    strs_textcontains: String
    strs: [String]
    strs_in: [[String]]
    strs_contains: String
    strs_ne: [String]
    ints_lt: Int
    ints_lte: Int
    ints_gt: Int
    ints_gte: Int
    ints_emlt: Int
    ints_emlte: Int
    ints_emgt: Int
    ints_emgte: Int
    floats_lt: Float
    floats_lte: Float
    floats_gt: Float
    floats_gte: Float
    floats_emlt: Float
    floats_emlte: Float
    floats_emgt: Float
    floats_emgte: Float
    OR: [ThingFilters]
  }
  
  `;
  
  
  export const mutation = `
  
    createThing(
      Thing: ThingInput
    ): ThingMutationResult
  
    updateThing(
      _id: String,
      Thing: ThingMutationInput
    ): ThingMutationResult
  
    deleteThing(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allThings(
      _id: String,
      _id_ne: String,
      _id_in: [String],
      name_contains: String,
      name_startsWith: String,
      name_endsWith: String,
      name: String,
      name_ne: String,
      name_in: [String],
      strs_textcontains: String,
      strs: [String],
      strs_in: [[String]],
      strs_contains: String,
      strs_ne: [String],
      ints_lt: Int,
      ints_lte: Int,
      ints_gt: Int,
      ints_gte: Int,
      ints_emlt: Int,
      ints_emlte: Int,
      ints_emgt: Int,
      ints_emgte: Int,
      floats_lt: Float,
      floats_lte: Float,
      floats_gt: Float,
      floats_gte: Float,
      floats_emlt: Float,
      floats_emlte: Float,
      floats_emgt: Float,
      floats_emgte: Float,
      OR: [ThingFilters],
      SORT: ThingSort,
      SORTS: [ThingSort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): ThingQueryResults
  
    getThing(
      _id: String
    ): ThingSingleQueryResult
  
  `;
  
  
  