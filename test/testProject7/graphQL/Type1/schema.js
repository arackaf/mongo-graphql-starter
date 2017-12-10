export const type = `
  
  type Type1 {
    _id: String
    field1: String
    field2: String
    autoAdjustField: Int
    poisonField: Int
    autoUpdateField: Int
    userId: Int
  
  }
  
  type Type1QueryResults {
    Type1s: [Type1],
    Meta: QueryResultsMetadata
  }

  type Type1SingleQueryResult {
    Type1: Type1
  }

  type Type1MutationResult {
    Type1: Type1
  }

  input Type1Input {
    _id: String
    field1: String
    field2: String
    autoAdjustField: Int
    poisonField: Int
    autoUpdateField: Int
    userId: Int
  }
  
  input Type1MutationInput {
    field1: String
    field2: String
    autoAdjustField: Int
    autoAdjustField_INC: Int
    autoAdjustField_DEC: Int
    poisonField: Int
    poisonField_INC: Int
    poisonField_DEC: Int
    autoUpdateField: Int
    autoUpdateField_INC: Int
    autoUpdateField_DEC: Int
    userId: Int
    userId_INC: Int
    userId_DEC: Int
  }
  
  input Type1Sort {
    _id: Int
    field1: Int
    field2: Int
    autoAdjustField: Int
    poisonField: Int
    autoUpdateField: Int
    userId: Int
  }
      
  input Type1Filters {
    _id: String
    _id_ne: String
    _id_in: [String]
    field1_contains: String
    field1_startsWith: String
    field1_endsWith: String
    field1_regex: String
    field1: String
    field1_ne: String
    field1_in: [String]
    field2_contains: String
    field2_startsWith: String
    field2_endsWith: String
    field2_regex: String
    field2: String
    field2_ne: String
    field2_in: [String]
    autoAdjustField_lt: Int
    autoAdjustField_lte: Int
    autoAdjustField_gt: Int
    autoAdjustField_gte: Int
    autoAdjustField: Int
    autoAdjustField_ne: Int
    autoAdjustField_in: [Int]
    poisonField_lt: Int
    poisonField_lte: Int
    poisonField_gt: Int
    poisonField_gte: Int
    poisonField: Int
    poisonField_ne: Int
    poisonField_in: [Int]
    autoUpdateField_lt: Int
    autoUpdateField_lte: Int
    autoUpdateField_gt: Int
    autoUpdateField_gte: Int
    autoUpdateField: Int
    autoUpdateField_ne: Int
    autoUpdateField_in: [Int]
    userId_lt: Int
    userId_lte: Int
    userId_gt: Int
    userId_gte: Int
    userId: Int
    userId_ne: Int
    userId_in: [Int]
    OR: [Type1Filters]
  }
  
  `;
  
  
  export const mutation = `
  
    createType1(
      Type1: Type1Input
    ): Type1MutationResult
  
    updateType1(
      _id: String,
      Type1: Type1MutationInput
    ): Type1MutationResult
  
    deleteType1(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allType1s(
      _id: String,
      _id_ne: String,
      _id_in: [String],
      field1_contains: String,
      field1_startsWith: String,
      field1_endsWith: String,
      field1_regex: String,
      field1: String,
      field1_ne: String,
      field1_in: [String],
      field2_contains: String,
      field2_startsWith: String,
      field2_endsWith: String,
      field2_regex: String,
      field2: String,
      field2_ne: String,
      field2_in: [String],
      autoAdjustField_lt: Int,
      autoAdjustField_lte: Int,
      autoAdjustField_gt: Int,
      autoAdjustField_gte: Int,
      autoAdjustField: Int,
      autoAdjustField_ne: Int,
      autoAdjustField_in: [Int],
      poisonField_lt: Int,
      poisonField_lte: Int,
      poisonField_gt: Int,
      poisonField_gte: Int,
      poisonField: Int,
      poisonField_ne: Int,
      poisonField_in: [Int],
      autoUpdateField_lt: Int,
      autoUpdateField_lte: Int,
      autoUpdateField_gt: Int,
      autoUpdateField_gte: Int,
      autoUpdateField: Int,
      autoUpdateField_ne: Int,
      autoUpdateField_in: [Int],
      userId_lt: Int,
      userId_lte: Int,
      userId_gt: Int,
      userId_gte: Int,
      userId: Int,
      userId_ne: Int,
      userId_in: [Int],
      OR: [Type1Filters],
      SORT: Type1Sort,
      SORTS: [Type1Sort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): Type1QueryResults
  
    getType1(
      _id: String
    ): Type1SingleQueryResult
  
  `;
  
  
  