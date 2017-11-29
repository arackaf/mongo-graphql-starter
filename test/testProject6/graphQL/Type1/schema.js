export const type = `
  
  type Type1 {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  
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
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type1MutationInput {
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type1Sort {
    _id: Int
    field1: Int
    field2: Int
    field3: Int
    field4: Int
    field5: Int
    field6: Int
  }
      
  input Type1Filters {
    _id: String
    _id_in: [String]
    field1_contains: String
    field1_startsWith: String
    field1_endsWith: String
    field1: String
    field1_in: [String]
    field2_contains: String
    field2_startsWith: String
    field2_endsWith: String
    field2: String
    field2_in: [String]
    field3_contains: String
    field3_startsWith: String
    field3_endsWith: String
    field3: String
    field3_in: [String]
    field4_contains: String
    field4_startsWith: String
    field4_endsWith: String
    field4: String
    field4_in: [String]
    field5_contains: String
    field5_startsWith: String
    field5_endsWith: String
    field5: String
    field5_in: [String]
    field6_contains: String
    field6_startsWith: String
    field6_endsWith: String
    field6: String
    field6_in: [String]
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
      _id_in: [String],
      field1_contains: String,
      field1_startsWith: String,
      field1_endsWith: String,
      field1: String,
      field1_in: [String],
      field2_contains: String,
      field2_startsWith: String,
      field2_endsWith: String,
      field2: String,
      field2_in: [String],
      field3_contains: String,
      field3_startsWith: String,
      field3_endsWith: String,
      field3: String,
      field3_in: [String],
      field4_contains: String,
      field4_startsWith: String,
      field4_endsWith: String,
      field4: String,
      field4_in: [String],
      field5_contains: String,
      field5_startsWith: String,
      field5_endsWith: String,
      field5: String,
      field5_in: [String],
      field6_contains: String,
      field6_startsWith: String,
      field6_endsWith: String,
      field6: String,
      field6_in: [String],
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
  
  
  