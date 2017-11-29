export const type = `
  
  type Type4 {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  
  }
  
  type Type4QueryResults {
    Type4s: [Type4],
    Meta: QueryResultsMetadata
  }

  type Type4SingleQueryResult {
    Type4: Type4
  }

  type Type4MutationResult {
    Type4: Type4
  }

  input Type4Input {
    _id: String
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type4MutationInput {
    field1: String
    field2: String
    field3: String
    field4: String
    field5: String
    field6: String
  }
  
  input Type4Sort {
    _id: Int
    field1: Int
    field2: Int
    field3: Int
    field4: Int
    field5: Int
    field6: Int
  }
      
  input Type4Filters {
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
    OR: [Type4Filters]
  }
  
  `;
  
  
  export const mutation = `
  
    createType4(
      Type4: Type4Input
    ): Type4MutationResult
  
    updateType4(
      _id: String,
      Type4: Type4MutationInput
    ): Type4MutationResult
  
    deleteType4(
      _id: String
    ): Boolean
  
  `;
  
  
  export const query = `
  
    allType4s(
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
      OR: [Type4Filters],
      SORT: Type4Sort,
      SORTS: [Type4Sort],
      LIMIT: Int,
      SKIP: Int,
      PAGE: Int,
      PAGE_SIZE: Int
    ): Type4QueryResults
  
    getType4(
      _id: String
    ): Type4SingleQueryResult
  
  `;
  
  
  