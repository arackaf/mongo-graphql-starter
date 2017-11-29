export const type = `
  
  type Type2 {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  
  }
  
  type Type2QueryResults {
    Type2s: [Type2],
    Meta: QueryResultsMetadata
  }

  type Type2SingleQueryResult {
    Type2: Type2
  }

  type Type2MutationResult {
    Type2: Type2
  }

  input Type2Input {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type2MutationInput {
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type2Sort {
    _id: Int
    field1: Int
    field2: Int
    field3: Int
    field4: Int
    field5: Int
    field6: Int
  }
      
  input Type2Filters {
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
    OR: [Type2Filters]
  }
  
  `;
  
  
  export const mutation = `
  
    createType2(
      Type2: Type2Input
    ): Type2MutationResult
  
    updateType2(
      _id: String,
      Type2: Type2MutationInput
    ): Type2MutationResult
  
    deleteType2(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allType2s(
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
      OR: [Type2Filters],
      SORT: Type2Sort,
      SORTS: [Type2Sort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): Type2QueryResults
  
    getType2(
      _id: String
    ): Type2SingleQueryResult
  
  `;
  
  
  